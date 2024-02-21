import Permissions from '../../../../support/dictionary/permissions';
import DataImport from '../../../../support/fragments/data_import/dataImport';
import InventoryInstance from '../../../../support/fragments/inventory/inventoryInstance';
import InventoryInstances from '../../../../support/fragments/inventory/inventoryInstances';
import MarcAuthorities from '../../../../support/fragments/marcAuthority/marcAuthorities';
import MarcAuthority from '../../../../support/fragments/marcAuthority/marcAuthority';
import TopMenu from '../../../../support/fragments/topMenu';
import Users from '../../../../support/fragments/users/users';
import getRandomPostfix from '../../../../support/utils/stringTools';

describe('MARC', () => {
  describe('plug-in MARC authority', () => {
    describe('plug-in MARC authority | Search', () => {
      const testData = {
        forC359206: {
          lcControlNumberA: 'n  00000911',
          lcControlNumberB: 'n  79125030',
          searchOption: 'Identifier (all)',
          valueA: 'Erbil, H. Yıldırım',
          valueB: 'Twain, Mark,',
        },
        forC359228: {
          searchOption: 'Corporate/Conference name',
          type: 'Authorized',
          typeOfHeadingA: 'Corporate Name',
          typeOfHeadingB: 'Conference Name',
          all: '*',
          title: 'Apple Academic Press',
        },
        forC359229: {
          searchOptionA: 'Geographic name',
          searchOptionB: 'Keyword',
          valueA: 'Gulf Stream',
          valueB: 'North',
          type: 'Authorized',
        },
        forC359230: {
          searchOptionA: 'Name-title',
          searchOptionB: 'Personal name',
          typeOfHeadingA: 'Personal Name',
          typeOfHeadingB: 'Corporate Name',
          typeOfHeadingC: 'Conference Name',
          value: 'C380569 Twain, Mark, 1835-1910. Adventures of Huckleberry Finn',
          valurMarked: 'C380569 Twain, Mark,',
          type: 'Authorized',
        },
        forC359231: {
          searchOption: 'Uniform title',
          value: 'Marvel comics',
        },
      };

      const marcFiles = [
        {
          marc: 'oneMarcBib.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
          numOfRecords: 1,
          propertyName: 'relatedInstanceInfo',
        },
        {
          marc: 'marcFileForC359015.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 2,
          propertyName: 'relatedAuthorityInfo',
        },
        {
          marc: 'marcFileForC359206.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 2,
          propertyName: 'relatedAuthorityInfo',
        },
        {
          marc: 'marcFileForC359228.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 5,
          propertyName: 'relatedAuthorityInfo',
        },
        {
          marc: 'marcFileForC359229.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 2,
          propertyName: 'relatedAuthorityInfo',
        },
        {
          marc: 'marcFileForC359231.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 1,
          propertyName: 'relatedAuthorityInfo',
        },
        {
          marc: 'marcFileForC380566.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 2,
          propertyName: 'relatedAuthorityInfo',
        },
      ];

      const marcFileForC380569 = [
        {
          marc: 'marcFileForC359230_2.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 1,
          propertyName: 'relatedAuthorityInfo',
        },
        {
          marc: 'marcFileForC359230_3.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 1,
          propertyName: 'relatedAuthorityInfo',
        },
        {
          marc: 'marcFileForC359230_twain.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 1,
          propertyName: 'relatedAuthorityInfo',
        },
      ];

      const createdAuthorityIDs = [];

      before('Creating user', () => {
        cy.createTempUser([
          Permissions.inventoryAll.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
          Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
          Permissions.uiQuickMarcQuickMarcAuthorityLinkUnlink.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;

          cy.getAdminToken();
          DataImport.uploadFileViaApi(
            marcFiles[0].marc,
            marcFiles[0].fileName,
            marcFiles[0].jobProfileToRun,
          ).then((response) => {
            response.entries.forEach((record) => {
              createdAuthorityIDs.push(record[marcFiles[0].propertyName].idList[0]);
            });
          });
        });
      });

      after('Deleting created user', () => {
        cy.getAdminToken();
        Users.deleteViaApi(testData.userProperties.userId);
        InventoryInstance.deleteInstanceViaApi(createdAuthorityIDs[0]);
        createdAuthorityIDs.forEach((id, index) => {
          if (index) MarcAuthority.deleteViaAPI(id);
        });
      });

      it(
        'C380565 MARC Authority plug-in | Search for MARC authority records when the user clicks on the "Link" icon (spitfire)',
        { tags: ['smoke', 'spitfire'] },
        () => {
          cy.getAdminToken();
          DataImport.uploadFileViaApi(
            marcFiles[1].marc,
            marcFiles[1].fileName,
            marcFiles[1].jobProfileToRun,
          ).then((response) => {
            response.entries.forEach((record) => {
              createdAuthorityIDs.push(record[marcFiles[1].propertyName].idList[0]);
            });
          });
          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
          InventoryInstances.searchByTitle(createdAuthorityIDs[0]);
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          InventoryInstance.verifyAndClickLinkIcon('700');
          MarcAuthorities.switchToSearch();
          InventoryInstance.verifySelectMarcAuthorityModal();
          InventoryInstance.verifySearchAndFilterDisplay();
          InventoryInstance.verifySearchOptions();
          InventoryInstance.fillInAndSearchResults('Starr, Lisa');
          InventoryInstance.checkResultsListPaneHeader();
          InventoryInstance.checkSearchResultsTable();
          InventoryInstance.selectRecord();
          InventoryInstance.checkRecordDetailPage('Starr, Lisa');
          MarcAuthorities.checkFieldAndContentExistence('100', '$a Starr, Lisa');
          InventoryInstance.closeDetailsView();
          InventoryInstance.closeFindAuthorityModal();
        },
      );

      it(
        'C359206 MARC Authority plug-in | Search using "Identifier (all)" option (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          cy.getAdminToken();
          DataImport.uploadFileViaApi(
            marcFiles[2].marc,
            marcFiles[2].fileName,
            marcFiles[2].jobProfileToRun,
          ).then((response) => {
            response.entries.forEach((record) => {
              createdAuthorityIDs.push(record[marcFiles[2].propertyName].idList[0]);
            });
          });
          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
          InventoryInstances.searchByTitle(createdAuthorityIDs[0]);
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          InventoryInstance.verifyAndClickLinkIcon('700');
          MarcAuthorities.switchToSearch();
          InventoryInstance.verifySearchOptions();
          MarcAuthorities.searchBy(
            testData.forC359206.searchOption,
            testData.forC359206.lcControlNumberA,
          );
          MarcAuthorities.checkFieldAndContentExistence(
            '010',
            testData.forC359206.lcControlNumberA,
          );
          InventoryInstance.checkRecordDetailPage(testData.forC359206.valueA);
          MarcAuthorities.searchBy(
            testData.forC359206.searchOption,
            testData.forC359206.lcControlNumberB,
          );
          MarcAuthorities.checkFieldAndContentExistence(
            '010',
            testData.forC359206.lcControlNumberB,
          );
          InventoryInstance.checkRecordDetailPage(testData.forC359206.valueB);
          MarcAuthorities.clickResetAndCheck();
        },
      );

      it(
        'C380567 MARC Authority plug-in | Search using "Corporate/Conference name" option (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          cy.getAdminToken();
          DataImport.uploadFileViaApi(
            marcFiles[3].marc,
            marcFiles[3].fileName,
            marcFiles[3].jobProfileToRun,
          ).then((response) => {
            response.entries.forEach((record) => {
              createdAuthorityIDs.push(record[marcFiles[2].propertyName].idList[0]);
            });
          });
          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
          InventoryInstances.searchByTitle(createdAuthorityIDs[0]);
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          InventoryInstance.verifyAndClickLinkIcon('700');
          MarcAuthorities.switchToSearch();
          InventoryInstance.verifySearchOptions();
          MarcAuthorities.searchByParameter(
            testData.forC359228.searchOption,
            testData.forC359228.all,
          );
          // wait for the results to be loaded.
          cy.wait(1000);
          MarcAuthorities.checkAfterSearchHeadingType(
            testData.forC359228.type,
            testData.forC359228.typeOfHeadingA,
            testData.forC359228.typeOfHeadingB,
          );
          MarcAuthorities.selectTitle(testData.forC359228.title);
          MarcAuthorities.checkRecordDetailPageMarkedValue(testData.forC359228.title);
          MarcAuthorities.chooseTypeOfHeadingAndCheck(
            testData.forC359228.typeOfHeadingB,
            testData.forC359228.typeOfHeadingA,
            testData.forC359228.typeOfHeadingB,
          );
        },
      );

      it(
        'C380568 MARC Authority plug-in | Search using "Geographic name" option (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          cy.getAdminToken();
          DataImport.uploadFileViaApi(
            marcFiles[4].marc,
            marcFiles[4].fileName,
            marcFiles[4].jobProfileToRun,
          ).then((response) => {
            response.entries.forEach((record) => {
              createdAuthorityIDs.push(record[marcFiles[4].propertyName].idList[0]);
            });
          });
          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
          InventoryInstances.searchByTitle(createdAuthorityIDs[0]);
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          InventoryInstance.verifyAndClickLinkIcon('700');
          MarcAuthorities.switchToSearch();
          InventoryInstance.verifySearchOptions();
          MarcAuthorities.searchBy(testData.forC359229.searchOptionA, testData.forC359229.valueA);
          MarcAuthorities.checkFieldAndContentExistence('151', testData.forC359229.valueA);
          InventoryInstance.checkRecordDetailPage(testData.forC359229.valueA);
          MarcAuthorities.searchBy(testData.forC359229.searchOptionB, testData.forC359229.valueB);
          MarcAuthorities.checkResultsExistance(testData.forC359229.type);
        },
      );

      it(
        'C380569 MARC Authority plug-in | Search using "Name-title" option (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          cy.getAdminToken();
          marcFileForC380569.forEach((marcFile) => {
            DataImport.uploadFileViaApi(
              marcFile.marc,
              marcFile.fileName,
              marcFile.jobProfileToRun,
            ).then((response) => {
              response.entries.forEach((record) => {
                createdAuthorityIDs.push(record[marcFile.propertyName].idList[0]);
              });
            });
          });
          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
          InventoryInstances.searchByTitle(createdAuthorityIDs[0]);
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          InventoryInstance.verifyAndClickLinkIcon('700');
          MarcAuthorities.switchToSearch();
          InventoryInstance.verifySearchOptions();
          MarcAuthorities.searchByParameter(testData.forC359230.searchOptionA, '*');
          // wait for the results to be loaded.
          cy.wait(1000);
          MarcAuthorities.checkHeadingType(
            testData.forC359230.type,
            testData.forC359230.typeOfHeadingA,
            testData.forC359230.typeOfHeadingB,
            testData.forC359230.typeOfHeadingC,
          );
          MarcAuthorities.selectTitle(testData.forC359230.value);
          MarcAuthorities.checkRecordDetailPageMarkedValue(testData.forC359230.valurMarked);
          MarcAuthorities.searchBy(testData.forC359230.searchOptionB, '*');
          MarcAuthorities.checkSingleHeadingType(
            testData.forC359230.type,
            testData.forC359230.typeOfHeadingA,
          );
        },
      );

      it(
        'C380566 MARC Authority plug-in | Search using "Personal name" option (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          cy.getAdminToken();
          DataImport.uploadFileViaApi(
            marcFiles[6].marc,
            marcFiles[6].fileName,
            marcFiles[6].jobProfileToRun,
          ).then((response) => {
            response.entries.forEach((record) => {
              createdAuthorityIDs.push(record[marcFiles[6].propertyName].idList[0]);
            });
          });
          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
          InventoryInstances.searchByTitle(createdAuthorityIDs[0]);
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          InventoryInstance.verifyAndClickLinkIcon('700');
          MarcAuthorities.switchToSearch();
          InventoryInstance.verifySearchOptions();
          MarcAuthorities.searchByParameter('Personal name', 'C380566 Stone, Robert B.');
          MarcAuthorities.checkRecordDetailPageMarkedValue('C380566 Stone, Robert B.');
        },
      );

      it(
        'C380570 MARC Authority plug-in | Search using "Uniform title" option (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          cy.getAdminToken();
          DataImport.uploadFileViaApi(
            marcFiles[5].marc,
            marcFiles[5].fileName,
            marcFiles[5].jobProfileToRun,
          ).then((response) => {
            response.entries.forEach((record) => {
              createdAuthorityIDs.push(record[marcFiles[5].propertyName].idList[0]);
            });
          });
          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
          InventoryInstances.searchByTitle(createdAuthorityIDs[0]);
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          InventoryInstance.verifyAndClickLinkIcon('700');
          MarcAuthorities.clickReset();
          MarcAuthorities.switchToSearch();
          InventoryInstance.verifySearchOptions();
          MarcAuthorities.searchByParameter(
            testData.forC359231.searchOption,
            testData.forC359231.value,
          );
          MarcAuthorities.checkRecordDetailPageMarkedValue(testData.forC359231.value);
          MarcAuthorities.switchToBrowse();
          MarcAuthorities.checkDefaultBrowseOptions(testData.forC359231.value);
        },
      );
    });
  });
});
