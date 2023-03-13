/* eslint-disable cypress/no-unnecessary-waiting */
import getRandomPostfix from '../../../support/utils/stringTools';
import TestTypes from '../../../support/dictionary/testTypes';
import DevTeams from '../../../support/dictionary/devTeams';
import SettingsMenu from '../../../support/fragments/settingsMenu';
import NewFieldMappingProfile from '../../../support/fragments/data_import/mapping_profiles/newFieldMappingProfile';
import FieldMappingProfiles from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfiles';
import MarcFieldProtection from '../../../support/fragments/settings/dataImport/marcFieldProtection';
import FieldMappingProfileView from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfileView';
import ActionProfiles from '../../../support/fragments/data_import/action_profiles/actionProfiles';
import NewActionProfile from '../../../support/fragments/data_import/action_profiles/newActionProfile';
import MatchProfiles from '../../../support/fragments/data_import/match_profiles/matchProfiles';
import NewJobProfile from '../../../support/fragments/data_import/job_profiles/newJobProfile';
import JobProfiles from '../../../support/fragments/data_import/job_profiles/jobProfiles';
import TopMenu from '../../../support/fragments/topMenu';
import DataImport from '../../../support/fragments/data_import/dataImport';
import FileDetails from '../../../support/fragments/data_import/logs/fileDetails';
import Logs from '../../../support/fragments/data_import/logs/logs';
import FileManager from '../../../support/utils/fileManager';
import InstanceRecordView from '../../../support/fragments/inventory/instanceRecordView';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import InventoryViewSource from '../../../support/fragments/inventory/inventoryViewSource';
import InventorySearchAndFilter from '../../../support/fragments/inventory/inventorySearchAndFilter';

describe('ui-data-import', () => {
  let firstFieldId = null;
  let secondFieldId = null;
  let instanceHrid = null;

  // unique name for profiles
  const marcBibMapProfileNameForUpdate = `C17018 Update MARC Bib with protections.${getRandomPostfix()}`;
  const instanceMapProfileNameForUpdate = `C17018 Update instance 1.${getRandomPostfix()}`;
  const marcBibMapProfileNameForUpdateAndOverride = `C17018 Update MARC Bib with protection OVERRIDES.${getRandomPostfix()}`;
  const instanceMapProfileNameForUpdateAndOverride = `C17018 Update instance 2.${getRandomPostfix()}`;
  const marcBibActionProfileNameForUpdate = `C17018 Update MARC Bib with protections.${getRandomPostfix()}`;
  const instanceActionProfileNameForUpdate = `C17018 Update instance 1.${getRandomPostfix()}`;
  const marcBibActionProfileNameForUpdateAndOverride = `C17018 Update MARC Bib with protection OVERRIDES.${getRandomPostfix()}`;
  const instanceActionProfileNameForUpdateAndOverride = `C17018 Update MARC Bib with protection OVERRIDES.${getRandomPostfix()}`;
  const matchProfileName = `C17018 001 to 001 MARC Bib.${getRandomPostfix()}`;
  const jobProfileNameForUpdate = `C17018 Update 1: MARC Bib with protections.${getRandomPostfix()}`;
  const jobProfileNameForOverride = `C17018 Update 2: MARC Bib with protections.${getRandomPostfix()}`;

  // unique file name to upload
  const fileNameForCreatingInstance = `C17018autotestFileCreteInstance.${getRandomPostfix()}.mrc`;
  const fileNameForProtect = `C17018 marcFileForC17018-Rev1-Protect_${getRandomPostfix()}.mrc`;
  const fileNameForOverride = `C17018 marcFileForC17018-Rev2-Override_${getRandomPostfix()}.mrc`;
  const editedFileNameRev1 = `marcFileForC17018-Rev1-Protect_${getRandomPostfix()}.mrc`;
  const editedFileNameRev2 = `marcFileForC17018-Rev2-Override_${getRandomPostfix()}.mrc`;
  const fileForEditRev1 = 'marcFileForC17018-Rev1-Protect.mrc';
  const fileForEditRev2 = 'marcFileForC17018-Rev2-Override.mrc';

  const protectedFields = {
    firstField: '020',
    secondField: '514'
  };

  // notes for mapping profiles
  const noteForUpdateInstanceMappingProfile = 'This note was added when the MARC Bib was updated to check field protections';
  const noteForOverrideInstanceMappingProfile = 'This note was added when the MARC Bib was updated to check field protection OVERRIDES';

  // unique name for notes
  const administrativeNote = 'This note was added when the MARC Bib was updated to check field protections';
  const instanceNote = 'This is the ORIGINAL version of the non-repeatable 514 note';
  const updatedAdministativeNote = 'This note was added when the MARC Bib was updated to check field protection OVERRIDES';
  const updatedInstanceNote = 'This is the UPDATE 2 version of the non-repeatable 514 note, which should replace the UPDATE 1 version';
  const instanceHridFromFile = 'in00000000331';

  // resource identifiers in uploading files
  const resourceIdentifiers = [
    { type: 'ISBN', value: '0866985522' },
    { type: 'ISBN', value: '9782617632537' },
    { type: 'ISBN', value: '4934691323219 (paperback)' }
  ];

  beforeEach('create test data', () => {
    cy.loginAsAdmin();
    cy.getAdminToken()
      .then(() => {
        MarcFieldProtection.createMarcFieldProtectionViaApi({
          indicator1: '*',
          indicator2: '*',
          subfield: 'a',
          data: '*',
          source: 'USER',
          field: protectedFields.firstField
        })
          .then((resp) => {
            firstFieldId = resp.id;
          });
        MarcFieldProtection.createMarcFieldProtectionViaApi({
          indicator1: '*',
          indicator2: '*',
          subfield: '*',
          data: '*',
          source: 'USER',
          field: protectedFields.secondField
        })
          .then((resp) => {
            secondFieldId = resp.id;
          });
      });
  });

  after('delete test data', () => {
    MarcFieldProtection.deleteMarcFieldProtectionViaApi(firstFieldId);
    MarcFieldProtection.deleteMarcFieldProtectionViaApi(secondFieldId);
    // delete profiles
    JobProfiles.deleteJobProfile(jobProfileNameForUpdate);
    JobProfiles.deleteJobProfile(jobProfileNameForOverride);
    MatchProfiles.deleteMatchProfile(matchProfileName);
    ActionProfiles.deleteActionProfile(marcBibActionProfileNameForUpdate);
    ActionProfiles.deleteActionProfile(instanceActionProfileNameForUpdate);
    ActionProfiles.deleteActionProfile(marcBibActionProfileNameForUpdateAndOverride);
    ActionProfiles.deleteActionProfile(instanceActionProfileNameForUpdateAndOverride);
    FieldMappingProfiles.deleteFieldMappingProfile(marcBibMapProfileNameForUpdate);
    FieldMappingProfiles.deleteFieldMappingProfile(instanceMapProfileNameForUpdate);
    FieldMappingProfiles.deleteFieldMappingProfile(marcBibMapProfileNameForUpdateAndOverride);
    FieldMappingProfiles.deleteFieldMappingProfile(instanceMapProfileNameForUpdateAndOverride);
    // delete created files
    FileManager.deleteFile(`cypress/fixtures/${editedFileNameRev1}`);
    FileManager.deleteFile(`cypress/fixtures/${editedFileNameRev2}`);
    cy.getInstance({ limit: 1, expandAll: true, query: `"hrid"=="${instanceHrid}"` })
      .then((instance) => {
        InventoryInstance.deleteInstanceViaApi(instance.id);
      });
  });

  it('C17018 Check that field protection overrides work properly during data import (folijet)', { tags: [TestTypes.criticalPath, DevTeams.folijet] }, () => {
    const marcBibMappingProfile = {
      name: marcBibMapProfileNameForUpdate,
      typeValue : NewFieldMappingProfile.folioRecordTypeValue.marcBib
    };

    const instanceMappingProfile = {
      name: instanceMapProfileNameForUpdate,
      typeValue : NewFieldMappingProfile.folioRecordTypeValue.instance
    };

    const marcBibMappingProfileOverride = {
      name: marcBibMapProfileNameForUpdateAndOverride,
      typeValue : NewFieldMappingProfile.folioRecordTypeValue.marcBib
    };

    const instanceMappingProfileOverride = {
      name: instanceMapProfileNameForUpdateAndOverride,
      typeValue : NewFieldMappingProfile.folioRecordTypeValue.instance
    };

    const marcBibActionProfile = {
      typeValue: NewActionProfile.folioRecordTypeValue.marcBib,
      name: marcBibActionProfileNameForUpdate,
      action: 'Update (all record types except Orders, Invoices, or MARC Holdings)'
    };

    const instanceActionProfile = {
      typeValue: NewActionProfile.folioRecordTypeValue.instance,
      name: instanceActionProfileNameForUpdate,
      action: 'Update (all record types except Orders, Invoices, or MARC Holdings)'
    };

    const marcBibActionProfileOverride = {
      typeValue: NewActionProfile.folioRecordTypeValue.marcBib,
      name: marcBibActionProfileNameForUpdateAndOverride,
      action: 'Update (all record types except Orders, Invoices, or MARC Holdings)'
    };

    const instanceActionProfileOverride = {
      typeValue: NewActionProfile.folioRecordTypeValue.instance,
      name: instanceActionProfileNameForUpdateAndOverride,
      action: 'Update (all record types except Orders, Invoices, or MARC Holdings)'
    };

    const matchProfile = { profileName: matchProfileName,
      incomingRecordFields: {
        field: '001'
      },
      existingRecordFields: {
        field: '001'
      },
      matchCriterion: 'Exactly matches',
      existingRecordType: 'MARC_BIBLIOGRAPHIC' };

    const jobProfileForUpdate = {
      ...NewJobProfile.defaultJobProfile,
      profileName: jobProfileNameForUpdate,
      acceptedType: NewJobProfile.acceptedDataType.marc
    };

    const jobProfileForOverride = {
      ...NewJobProfile.defaultJobProfile,
      profileName: jobProfileNameForOverride,
      acceptedType: NewJobProfile.acceptedDataType.marc
    };

    // create Field mapping profiles
    cy.visit(SettingsMenu.mappingProfilePath);
    FieldMappingProfiles.createMappingProfileForUpdatesMarc(marcBibMappingProfile);
    FieldMappingProfileView.checkCreatedMappingProfile(marcBibMappingProfile.name, protectedFields.firstField, protectedFields.secondField);
    FieldMappingProfiles.checkMappingProfilePresented(marcBibMappingProfile.name);

    FieldMappingProfiles.createMappingProfileWithNotes(instanceMappingProfile, noteForUpdateInstanceMappingProfile);
    FieldMappingProfiles.checkMappingProfilePresented(instanceMappingProfile.name);

    FieldMappingProfiles.createMappingProfileForUpdatesAndOverrideMarc(marcBibMappingProfileOverride, protectedFields.firstField, protectedFields.secondField);
    FieldMappingProfileView.checkCreatedMappingProfile(marcBibMappingProfileOverride.name, protectedFields.firstField, protectedFields.secondField);
    FieldMappingProfiles.checkMappingProfilePresented(marcBibMappingProfileOverride.name);

    FieldMappingProfiles.createMappingProfileWithNotes(instanceMappingProfileOverride, noteForOverrideInstanceMappingProfile);
    FieldMappingProfiles.checkMappingProfilePresented(instanceMappingProfileOverride.name);

    // create Action profiles
    cy.visit(SettingsMenu.actionProfilePath);
    ActionProfiles.create(marcBibActionProfile, marcBibMappingProfile.name);
    ActionProfiles.checkActionProfilePresented(marcBibActionProfile.name);

    ActionProfiles.create(instanceActionProfile, instanceMappingProfile.name);
    ActionProfiles.checkActionProfilePresented(instanceActionProfile.name);

    ActionProfiles.create(marcBibActionProfileOverride, marcBibMappingProfileOverride.name);
    ActionProfiles.checkActionProfilePresented(marcBibActionProfileOverride.name);

    ActionProfiles.create(instanceActionProfileOverride, instanceMappingProfileOverride.name);
    ActionProfiles.checkActionProfilePresented(instanceActionProfileOverride.name);

    // create Match profile
    cy.visit(SettingsMenu.matchProfilePath);
    MatchProfiles.createMatchProfile(matchProfile);
    MatchProfiles.checkMatchProfilePresented(matchProfile.profileName);

    // create Job profiles
    cy.visit(SettingsMenu.jobProfilePath);
    JobProfiles.createJobProfile(jobProfileForUpdate);
    NewJobProfile.linkMatchAndTwoActionProfiles(matchProfile.profileName, marcBibActionProfile.name, instanceActionProfile.name);
    NewJobProfile.saveAndClose();
    JobProfiles.checkJobProfilePresented(jobProfileForUpdate.profileName);

    // need to wait until the first job profile will be created
    cy.wait(2500);
    JobProfiles.createJobProfile(jobProfileForOverride);
    NewJobProfile.linkMatchAndTwoActionProfiles(matchProfile.profileName, marcBibActionProfileOverride.name, instanceActionProfileOverride.name);
    NewJobProfile.saveAndClose();
    JobProfiles.checkJobProfilePresented(jobProfileForOverride.profileName);

    cy.visit(TopMenu.dataImportPath);
    // upload a marc file
    // TODO delete reload after fix https://issues.folio.org/browse/MODDATAIMP-691
    cy.reload();
    DataImport.uploadFile('marcFileForC17018-BeforeOverride.mrc', fileNameForCreatingInstance);
    JobProfiles.searchJobProfileForImport('Default - Create instance and SRS MARC Bib');
    JobProfiles.runImportFile();
    JobProfiles.waitFileIsImported(fileNameForCreatingInstance);
    Logs.checkStatusOfJobProfile('Completed');
    Logs.openFileDetails(fileNameForCreatingInstance);
    [FileDetails.columnName.srsMarc, FileDetails.columnName.instance].forEach(columnName => {
      FileDetails.checkStatusInColumn(FileDetails.status.created, columnName);
    });
    FileDetails.checkSrsRecordQuantityInSummaryTable('1', 0);
    FileDetails.checkInstanceQuantityInSummaryTable('1', 0);

    // get Instance HRID through API
    InventorySearchAndFilter.getInstanceHRID()
      .then(hrId => {
        instanceHrid = hrId[0];
        DataImport.editMarcFile(fileForEditRev1, editedFileNameRev1, [instanceHridFromFile], [instanceHrid]);
        DataImport.editMarcFile(fileForEditRev2, editedFileNameRev2, [instanceHridFromFile], [instanceHrid]);

        // upload a marc file
        cy.visit(TopMenu.dataImportPath);
        // TODO delete reload after fix https://issues.folio.org/browse/MODDATAIMP-691
        cy.reload();
        DataImport.uploadFile(editedFileNameRev1, fileNameForProtect);
        JobProfiles.searchJobProfileForImport(jobProfileForUpdate.profileName);
        JobProfiles.runImportFile();
        JobProfiles.waitFileIsImported(fileNameForProtect);
        Logs.checkStatusOfJobProfile('Completed');
        Logs.openFileDetails(fileNameForProtect);
        [FileDetails.columnName.srsMarc, FileDetails.columnName.instance].forEach(columnName => {
          FileDetails.checkStatusInColumn(FileDetails.status.updated, columnName);
        });
        FileDetails.checkSrsRecordQuantityInSummaryTable('1', 1);
        FileDetails.checkInstanceQuantityInSummaryTable('1', 1);

        cy.visit(TopMenu.inventoryPath);
        InventorySearchAndFilter.searchInstanceByHRID(instanceHrid);
        InstanceRecordView.verifyAdministrativeNote(administrativeNote);
        InventoryInstance.verifyResourceIdentifier(resourceIdentifiers[0].type, resourceIdentifiers[0].value, 0);
        InventoryInstance.verifyResourceIdentifier(resourceIdentifiers[1].type, resourceIdentifiers[1].value, 2);
        InventoryInstance.verifyResourceIdentifier(resourceIdentifiers[2].type, resourceIdentifiers[2].value, 1);
        InstanceRecordView.verifyInstanceNote(instanceNote);
        // verify table data in marc bibliographic source
        InventoryInstance.viewSource();
        resourceIdentifiers.forEach(element => {
          InventoryViewSource.verifyFieldInMARCBibSource(protectedFields.firstField, element.value);
        });
        InventoryViewSource.verifyFieldInMARCBibSource(protectedFields.secondField, instanceNote);

        // upload a marc file
        cy.visit(TopMenu.dataImportPath);
        // TODO delete reload after fix https://issues.folio.org/browse/MODDATAIMP-691
        cy.reload();
        DataImport.uploadFile(editedFileNameRev2, fileNameForOverride);
        JobProfiles.searchJobProfileForImport(jobProfileForOverride.profileName);
        JobProfiles.runImportFile();
        JobProfiles.waitFileIsImported(fileNameForOverride);
        Logs.checkStatusOfJobProfile('Completed');
        Logs.openFileDetails(fileNameForOverride);
        [FileDetails.columnName.srsMarc, FileDetails.columnName.instance].forEach(columnName => {
          FileDetails.checkStatusInColumn(FileDetails.status.updated, columnName);
        });
        FileDetails.checkSrsRecordQuantityInSummaryTable('1', 1);
        FileDetails.checkInstanceQuantityInSummaryTable('1', 1);

        cy.visit(TopMenu.inventoryPath);
        InventorySearchAndFilter.searchInstanceByHRID(instanceHrid);
        InstanceRecordView.verifyAdministrativeNote(administrativeNote);
        InstanceRecordView.verifyAdministrativeNote(updatedAdministativeNote);
        resourceIdentifiers.forEach(element => {
          InventoryInstance.verifyResourceIdentifierAbsent(element.value);
        });
        InstanceRecordView.verifyInstanceNote(updatedInstanceNote);
        // verify table data in marc bibliographic source
        InventoryInstance.viewSource();
        InventoryViewSource.notContains(`${protectedFields.firstField}\t`);
        InventoryViewSource.verifyFieldInMARCBibSource(protectedFields.secondField, updatedInstanceNote);
      });
  });
});
