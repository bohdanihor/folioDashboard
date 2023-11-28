import TestTypes from '../../../../../support/dictionary/testTypes';
import DevTeams from '../../../../../support/dictionary/devTeams';
import Permissions from '../../../../../support/dictionary/permissions';
import TopMenu from '../../../../../support/fragments/topMenu';
import Users from '../../../../../support/fragments/users/users';
import InventoryInstances from '../../../../../support/fragments/inventory/inventoryInstances';
import InventoryInstance from '../../../../../support/fragments/inventory/inventoryInstance';
import DataImport from '../../../../../support/fragments/data_import/dataImport';
import Logs from '../../../../../support/fragments/data_import/logs/logs';
import JobProfiles from '../../../../../support/fragments/data_import/job_profiles/jobProfiles';
import getRandomPostfix from '../../../../../support/utils/stringTools';
import MarcAuthority from '../../../../../support/fragments/marcAuthority/marcAuthority';
import MarcAuthorities from '../../../../../support/fragments/marcAuthority/marcAuthorities';
import QuickMarcEditor from '../../../../../support/fragments/quickMarcEditor';
import { JOB_STATUS_NAMES } from '../../../../../support/constants';

describe('Manual Linking Bib field to Authority 1XX', () => {
  const testData = {
    tag655: '655',
    subjectValue: 'C377035 Drama--TestV--TestX--TestY--TestZ',
    linkedIconText: 'Linked to MARC authority',
    subjectAccordion: 'Subject',
  };

  const marcFiles = [
    {
      marc: 'marcBibFileC377035.mrc',
      fileName: `testMarcFileC377035${getRandomPostfix()}.mrc`,
      jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
    },
    {
      marc: 'marcAuthFileC377035.mrc',
      fileName: `testMarcFileC377035${getRandomPostfix()}.mrc`,
      jobProfileToRun: 'Default - Create SRS MARC Authority',
      authorityHeading: 'C377035 Drama',
    },
  ];

  const createdRecordIDs = [];

  const bib655AfterLinkingToAuth155 = [
    52,
    testData.tag655,
    '\\',
    '7',
    '$a C377035 Drama',
    '$v TestV $x TestX $y TestY $z TestZ',
    '$0 id.loc.gov/authorities/genreForms/gf2014026297',
    '$2 fast',
  ];

  before('Creating user', () => {
    cy.createTempUser([
      Permissions.inventoryAll.gui,
      Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
      Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
      Permissions.uiQuickMarcQuickMarcAuthorityLinkUnlink.gui,
    ]).then((createdUserProperties) => {
      testData.userProperties = createdUserProperties;

      marcFiles.forEach((marcFile) => {
        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            DataImport.verifyUploadState();
            DataImport.uploadFileAndRetry(marcFile.marc, marcFile.fileName);
            JobProfiles.waitLoadingList();
            JobProfiles.search(marcFile.jobProfileToRun);
            JobProfiles.runImportFile();
            JobProfiles.waitFileIsImported(marcFile.fileName);
            Logs.checkStatusOfJobProfile(JOB_STATUS_NAMES.COMPLETED);
            Logs.openFileDetails(marcFile.fileName);
            Logs.getCreatedItemsID().then((link) => {
              createdRecordIDs.push(link.split('/')[5]);
            });
          },
        );
      });
    });
  });

  beforeEach('Login to the application', () => {
    cy.login(testData.userProperties.username, testData.userProperties.password, {
      path: TopMenu.inventoryPath,
      waiter: InventoryInstances.waitContentLoading,
    });
  });

  after('Deleting created user', () => {
    cy.getAdminToken();
    Users.deleteViaApi(testData.userProperties.userId);
    createdRecordIDs.forEach((id, index) => {
      if (index) MarcAuthority.deleteViaAPI(id);
      else InventoryInstance.deleteInstanceViaApi(id);
    });
  });

  it(
    'C377035 Link the "655" of "MARC Bib" field to "MARC Authority" record (with "v", "x", "y", "z" subfields). (spitfire) (TaaS)',
    { tags: [TestTypes.extendedPath, DevTeams.spitfire] },
    () => {
      InventoryInstance.searchByTitle(createdRecordIDs[0]);
      InventoryInstances.selectInstance();
      InventoryInstance.editMarcBibliographicRecord();
      InventoryInstance.verifyAndClickLinkIcon(testData.tag655);
      InventoryInstance.verifySelectMarcAuthorityModal();
      InventoryInstance.verifySearchOptions();
      MarcAuthorities.switchToSearch();
      MarcAuthorities.clickReset();
      InventoryInstance.searchResults(marcFiles[1].authorityHeading);
      InventoryInstance.clickLinkButton();
      QuickMarcEditor.verifyAfterLinkingAuthority(testData.tag655);
      QuickMarcEditor.checkUnlinkTooltipText(testData.tag655, 'Unlink from MARC Authority record');
      QuickMarcEditor.checkViewMarcAuthorityTooltipText(bib655AfterLinkingToAuth155[0]);
      QuickMarcEditor.verifyTagFieldAfterLinking(...bib655AfterLinkingToAuth155);
      QuickMarcEditor.pressSaveAndClose();
      QuickMarcEditor.checkAfterSaveAndClose();
      InventoryInstance.verifyInstanceSubject(
        11,
        0,
        `${testData.linkedIconText}${testData.subjectValue}`,
      );
      InventoryInstance.checkExistanceOfAuthorityIconInInstanceDetailPane(
        testData.subjectAccordion,
      );
    },
  );
});