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
    describe('plug-in MARC authority | Browse', () => {
      const testData = {
        searchOptionA: 'Name-title',
        searchOptionB: 'Personal name',
        typeOfHeadingA: 'Personal Name',
        typeOfHeadingB: 'Corporate Name',
        typeOfHeadingC: 'Conference Name',
        value:
          'Dabbāgh, ʻAbd al-Raḥmān ibn Muḥammad, 1208 or 1209-1299 or 1300. Mashāriq anwār al-qulūb wa-mafātiḥ asrār al-ghuyūb',
        valueMarked: 'Dabbāgh, ʻAbd al-Raḥmān ibn Muḥammad,',
        valueForNewSearch: 'United States. Truth in Lending Act',
        authorized: 'Authorized',
        reference: 'Reference',
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
          marc: 'marcFileForC380554.mrc',
          fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          numOfRecords: 3,
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
          marcFiles.forEach((marcFile) => {
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
        InventoryInstance.deleteInstanceViaApi(createdAuthorityIDs[0]);
        createdAuthorityIDs.forEach((id, index) => {
          if (index) MarcAuthority.deleteViaAPI(id);
        });
      });

      it(
        'C380554 MARC Authority plug-in | Browse using "Name-title" option returns only records with the same "Type of heading" (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          InventoryInstances.searchByTitle(createdAuthorityIDs[0]);
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          InventoryInstance.verifyAndClickLinkIcon('700');
          MarcAuthorities.searchByParameter(testData.searchOptionA, testData.value);
          // wait for the results to be loaded.
          cy.wait(1000);
          MarcAuthorities.checkAuthorizedReferenceColumn(testData.authorized, testData.reference);
          MarcAuthorities.checkHeadingType(
            testData.authorized,
            testData.typeOfHeadingA,
            testData.typeOfHeadingB,
            testData.typeOfHeadingC,
          );
          MarcAuthorities.checkRow(testData.value);
          MarcAuthorities.selectTitle(testData.value);
          MarcAuthorities.checkRecordDetailPageMarkedValue(testData.valueMarked);
          MarcAuthorities.chooseTypeOfHeadingAndCheck(
            testData.typeOfHeadingA,
            testData.typeOfHeadingB,
            testData.typeOfHeadingA,
          );
          MarcAuthorities.searchBy(testData.searchOptionB, testData.valueForNewSearch);
          MarcAuthorities.checkSingleHeadingType(testData.authorized, testData.typeOfHeadingA);
        },
      );
    });
  });
});
