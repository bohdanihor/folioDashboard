import Permissions from '../../../support/dictionary/permissions';
import DataImport from '../../../support/fragments/data_import/dataImport';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import InventoryInstances from '../../../support/fragments/inventory/inventoryInstances';
import InventorySearchAndFilter from '../../../support/fragments/inventory/inventorySearchAndFilter';
import TopMenu from '../../../support/fragments/topMenu';
import Users from '../../../support/fragments/users/users';
import getRandomPostfix from '../../../support/utils/stringTools';

describe('inventory', () => {
  describe('Search in Inventory', () => {
    const testData = {
      searchQuery: 'C415263',
      languageAccordionName: 'Language',
      formatAccordionName: 'Format',
      languageOptionName: 'English',
      formatOptionName: 'unmediated -- volume',
    };

    const marcFiles = [
      {
        marc: 'marcBibFileC415263_1.mrc',
        fileName: `testMarcFileC415263.${getRandomPostfix()}.mrc`,
        jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
        propertyName: 'relatedInstanceInfo',
      },
      {
        marc: 'marcBibFileC415263_2.mrc',
        fileName: `testMarcFileC415263.${getRandomPostfix()}.mrc`,
        jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
        propertyName: 'relatedInstanceInfo',
      },
    ];

    const createdRecordIDs = [];

    before('Importing data', () => {
      cy.createTempUser([Permissions.inventoryAll.gui])
        .then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
          marcFiles.forEach((marcFile) => {
            DataImport.uploadFileViaApi(
              marcFile.marc,
              marcFile.fileName,
              marcFile.jobProfileToRun,
            ).then((response) => {
              response.entries.forEach((record) => {
                createdRecordIDs.push(record[marcFile.propertyName].idList[0]);
              });
            });
          });
        })
        .then(() => {
          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
        });
    });

    after('Deleting user, records', () => {
      cy.getAdminToken();
      Users.deleteViaApi(testData.userProperties.userId);
      createdRecordIDs.forEach((id) => {
        InventoryInstance.deleteInstanceViaApi(id);
      });
    });

    it(
      'C415263 Counters in expanded facet accordions updated when another facet is applied (spitfire)',
      { tags: ['criticalPath', 'spitfire'] },
      () => {
        InventoryInstances.searchByTitle(testData.searchQuery);
        InventorySearchAndFilter.checkRowsCount(2);
        InventorySearchAndFilter.clickAccordionByName(testData.languageAccordionName);
        InventorySearchAndFilter.verifyAccordionByNameExpanded(testData.languageAccordionName);
        InventorySearchAndFilter.verifyFilterOptionCount(
          testData.languageAccordionName,
          testData.languageOptionName,
          2,
        );
        InventorySearchAndFilter.clickAccordionByName(testData.formatAccordionName);
        InventorySearchAndFilter.verifyAccordionByNameExpanded(testData.formatAccordionName);
        InventorySearchAndFilter.verifyFilterOptionCount(
          testData.formatAccordionName,
          testData.formatOptionName,
          1,
        );
        InventorySearchAndFilter.selectOptionInExpandedFilter(
          testData.languageAccordionName,
          testData.languageOptionName,
        );
        InventorySearchAndFilter.selectOptionInExpandedFilter(
          testData.formatAccordionName,
          testData.formatOptionName,
        );
        InventorySearchAndFilter.verifyFilterOptionCount(
          testData.languageAccordionName,
          testData.languageOptionName,
          1,
        );
      },
    );
  });
});
