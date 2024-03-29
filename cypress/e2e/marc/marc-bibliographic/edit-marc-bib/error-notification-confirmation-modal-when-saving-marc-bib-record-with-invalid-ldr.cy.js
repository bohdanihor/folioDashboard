import Permissions from '../../../../support/dictionary/permissions';
import TopMenu from '../../../../support/fragments/topMenu';
import DataImport from '../../../../support/fragments/data_import/dataImport';
import Users from '../../../../support/fragments/users/users';
import QuickMarcEditor from '../../../../support/fragments/quickMarcEditor';
import getRandomPostfix from '../../../../support/utils/stringTools';
import InventoryInstances from '../../../../support/fragments/inventory/inventoryInstances';
import InventoryInstance from '../../../../support/fragments/inventory/inventoryInstance';
import InventorySearchAndFilter from '../../../../support/fragments/inventory/inventorySearchAndFilter';

const testData = {
  marc: 'marcBibFileForC375205.mrc',
  fileName: `testMarcFileC375205.${getRandomPostfix()}.mrc`,
  jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
  propertyName: 'relatedInstanceInfo',
  instanceTitle: 'The Journal of ecclesiastical history.',
  LDRValue: '01338cas\\a2200409\\\\\\4500',
  updateLDRValue: '01338cas\\a2200409\\\\\\450',
  searchOption: 'Keyword (title, contributor, identifier, HRID, UUID)',
};

let instanceId;

describe('MARC', () => {
  describe('MARC Bibliographic', () => {
    describe('Edit MARC bib', () => {
      before('Create test data', () => {
        cy.createTempUser([
          Permissions.inventoryAll.gui,
          Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;

          cy.getAdminToken();
          DataImport.uploadFileViaApi(
            testData.marc,
            testData.fileName,
            testData.jobProfileToRun,
          ).then((response) => {
            response.entries.forEach((record) => {
              instanceId = record[testData.propertyName].idList[0];
            });
          });

          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
        });
      });

      after('Delete test data', () => {
        cy.getAdminToken();
        Users.deleteViaApi(testData.userProperties.userId);
        InventoryInstance.deleteInstanceViaApi(instanceId);
      });

      it(
        'C375205 Error notification shown before confirmation modal when saving "MARC bib" record with invalid LDR (spitfire) (TaaS)',
        { tags: ['extendedPath', 'spitfire'] },
        () => {
          InventorySearchAndFilter.selectSearchOptions(
            testData.searchOption,
            testData.instanceTitle,
          );
          InventorySearchAndFilter.clickSearch();
          InventoryInstances.selectInstanceById(instanceId);
          InventoryInstance.waitLoading();
          InventoryInstance.editMarcBibliographicRecord();
          QuickMarcEditor.updateExistingField('LDR', testData.updateLDRValue);
          QuickMarcEditor.deleteFieldByTagAndCheck('222');
          QuickMarcEditor.clickSaveAndKeepEditingButton();
          QuickMarcEditor.verifyRecordCanNotBeSavedCalloutLDR();
          QuickMarcEditor.updateExistingField('LDR', testData.LDRValue);
          QuickMarcEditor.clickSaveAndCloseThenCheck(1);
          QuickMarcEditor.clickRestoreDeletedField();
          QuickMarcEditor.checkButtonsDisabled();
        },
      );
    });
  });
});
