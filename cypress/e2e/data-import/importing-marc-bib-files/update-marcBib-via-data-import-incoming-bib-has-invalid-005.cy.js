import { Permissions } from '../../../support/dictionary';
import {
  EXISTING_RECORDS_NAMES,
  FOLIO_RECORD_TYPE,
  JOB_STATUS_NAMES,
  RECORD_STATUSES,
  ACCEPTED_DATA_TYPE_NAMES,
} from '../../../support/constants';
import ActionProfiles from '../../../support/fragments/data_import/action_profiles/actionProfiles';
import DataImport from '../../../support/fragments/data_import/dataImport';
import JobProfiles from '../../../support/fragments/data_import/job_profiles/jobProfiles';
import NewJobProfile from '../../../support/fragments/data_import/job_profiles/newJobProfile';
import FileDetails from '../../../support/fragments/data_import/logs/fileDetails';
import Logs from '../../../support/fragments/data_import/logs/logs';
import FieldMappingProfileView from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfileView';
import FieldMappingProfiles from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfiles';
import MatchProfiles from '../../../support/fragments/data_import/match_profiles/matchProfiles';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import SettingsMenu from '../../../support/fragments/settingsMenu';
import TopMenu from '../../../support/fragments/topMenu';
import FileManager from '../../../support/utils/fileManager';
import getRandomPostfix from '../../../support/utils/stringTools';
import Users from '../../../support/fragments/users/users';
import InventoryViewSource from '../../../support/fragments/inventory/inventoryViewSource';
import { getLongDelay } from '../../../support/utils/cypressTools';

describe('data-import', () => {
  describe('Importing MARC Bib files', () => {
    const testData = {
      createdRecordIDs: [],
      filePathForCreate: 'oneMarcBib.mrc',
      jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
      fileNameForCreate: `C415267 marcFileName${getRandomPostfix()}.mrc`,
      filePathForUpdate: 'marcBibFileForC415267.mrc',
      editedFileName: `C415267 marcFileName${getRandomPostfix()}.mrc`,
      fileNameForUpdate: `C415267 marcFileName${getRandomPostfix()}.mrc`,
      tag005: '005',
    };
    const mappingProfile = {
      name: `C415267 Field mapping profile 2 - MODSOURCE-642 -MARC ${getRandomPostfix()}`,
      typeValue: FOLIO_RECORD_TYPE.MARCBIBLIOGRAPHIC,
      update: true,
    };
    const actionProfile = {
      typeValue: FOLIO_RECORD_TYPE.MARCBIBLIOGRAPHIC,
      name: `C415267 Action profile 2 - MODSOURCE-642 - MARC ${getRandomPostfix()}`,
      action: 'Update (all record types except Orders, Invoices, or MARC Holdings)',
    };
    const matchProfile = {
      profileName: `C415267 Match profile 2 - MODSOURCE-642 - MARC ${getRandomPostfix()}`,
      incomingRecordFields: {
        field: '001',
      },
      existingRecordFields: {
        field: '001',
      },
      matchCriterion: 'Exactly matches',
      existingRecordType: EXISTING_RECORDS_NAMES.MARC_BIBLIOGRAPHIC,
    };
    const jobProfile = {
      ...NewJobProfile.defaultJobProfile,
      profileName: `C415267 Job profile 2 - MODSOURCE-642 - MARC ${getRandomPostfix()}`,
      acceptedType: ACCEPTED_DATA_TYPE_NAMES.MARC,
    };

    before('create test data', () => {
      cy.createTempUser([
        Permissions.settingsDataImportEnabled.gui,
        Permissions.moduleDataImportEnabled.gui,
        Permissions.inventoryAll.gui,
        Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
      ]).then((userProperties) => {
        testData.user = userProperties;

        cy.intercept('GET', 'data-import/splitStatus').as('splitStatus');

        cy.login(testData.user.username, testData.user.password, {
          path: TopMenu.dataImportPath,
          waiter: DataImport.waitLoading,
        });
      });
    });

    after('delete test data', () => {
      cy.getAdminToken().then(() => {
        JobProfiles.deleteJobProfile(jobProfile.profileName);
        MatchProfiles.deleteMatchProfile(matchProfile.profileName);
        ActionProfiles.deleteActionProfile(actionProfile.name);
        FieldMappingProfileView.deleteViaApi(mappingProfile.name);
        Users.deleteViaApi(testData.user.userId);
        InventoryInstance.deleteInstanceViaApi(testData.createdRecordIDs[0]);
      });
      // delete created files
      FileManager.deleteFile(`cypress/fixtures/${testData.editedFileName}`);
      FileManager.deleteFile(`cypress/fixtures/${testData.fileNameForCreate}`);
    });

    // https://issues.folio.org/browse/MODSOURMAN-1106
    it(
      'C415267 Update MARC Bib via Data Import/incoming bib has invalid 005 (folijet) (TaaS)',
      { tags: ['extendedPath', 'folijet'] },
      () => {
        DataImport.verifyUploadState();
        DataImport.uploadFileAndRetry(testData.filePathForCreate, testData.fileNameForCreate);
        JobProfiles.waitLoadingList();
        JobProfiles.search(testData.jobProfileToRun);
        JobProfiles.runImportFile();
        JobProfiles.waitFileIsImported(testData.fileNameForCreate);
        Logs.checkStatusOfJobProfile(JOB_STATUS_NAMES.COMPLETED);
        Logs.openFileDetails(testData.fileNameForCreate);
        [
          FileDetails.columnNameInResultList.srsMarc,
          FileDetails.columnNameInResultList.instance,
        ].forEach((columnName) => {
          FileDetails.checkStatusInColumn(RECORD_STATUSES.CREATED, columnName);
        });
        FileDetails.openInstanceInInventory(RECORD_STATUSES.CREATED);
        InventoryInstance.getAssignedHRID().then((initialInstanceHrId) => {
          testData.instanceHrid = initialInstanceHrId;

          // create Field mapping profile
          cy.visit(SettingsMenu.mappingProfilePath);
          FieldMappingProfiles.createMappingProfileForUpdatesMarc(mappingProfile);
          FieldMappingProfileView.closeViewMode(mappingProfile.name);
          FieldMappingProfiles.checkMappingProfilePresented(mappingProfile.name);
          // create Action profile and link it to Field mapping profile
          cy.visit(SettingsMenu.actionProfilePath);
          ActionProfiles.create(actionProfile, mappingProfile.name);
          ActionProfiles.checkActionProfilePresented(actionProfile.name);
          // create Match profile
          cy.visit(SettingsMenu.matchProfilePath);
          MatchProfiles.createMatchProfile(matchProfile);
          // create Job profile
          cy.visit(SettingsMenu.jobProfilePath);
          JobProfiles.openNewJobProfileForm();
          NewJobProfile.fillJobProfile(jobProfile);
          NewJobProfile.linkMatchProfile(matchProfile.profileName);
          NewJobProfile.linkActionProfileForMatches(actionProfile.name);
          // wait for the action profile to be linked
          cy.wait(1000);
          NewJobProfile.saveAndClose();
          JobProfiles.waitLoadingList();
          JobProfiles.checkJobProfilePresented(jobProfile.profileName);

          DataImport.editMarcFile(
            testData.filePathForUpdate,
            testData.editedFileName,
            ['HRID'],
            [initialInstanceHrId],
          );

          cy.visit(TopMenu.dataImportPath);
          DataImport.verifyUploadState();
          DataImport.uploadFileAndRetry(testData.editedFileName, testData.fileNameForUpdate);
          JobProfiles.waitLoadingList();
          JobProfiles.search(jobProfile.profileName);
          JobProfiles.runImportFile();
          cy.wait('@splitStatus', getLongDelay()).then(() => {
            // set date after updating record
            const updatedDate = new Date();
            JobProfiles.waitFileIsImported(testData.fileNameForUpdate);
            Logs.checkStatusOfJobProfile(JOB_STATUS_NAMES.COMPLETED);
            Logs.openFileDetails(testData.fileNameForUpdate);
            [
              FileDetails.columnNameInResultList.srsMarc,
              FileDetails.columnNameInResultList.instance,
            ].forEach((columnName) => {
              FileDetails.checkStatusInColumn(RECORD_STATUSES.UPDATED, columnName);
            });
            Logs.getCreatedItemsID(1).then((link) => {
              testData.createdRecordIDs.push(link.split('/')[5]);
            });
            FileDetails.openInstanceInInventory(RECORD_STATUSES.UPDATED);
            InventoryInstance.viewSource();
            InventoryViewSource.contains(`${testData.tag005}\t`);
            InventoryViewSource.verifyFieldContent(3, updatedDate);
          });
        });
      },
    );
  });
});
