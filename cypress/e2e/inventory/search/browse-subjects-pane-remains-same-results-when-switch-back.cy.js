import {
  JOB_STATUS_NAMES,
  LOAN_TYPE_NAMES,
  LOCATION_NAMES,
  MATERIAL_TYPE_NAMES,
} from '../../../support/constants';
import { Permissions } from '../../../support/dictionary';
import DataImport from '../../../support/fragments/data_import/dataImport';
import JobProfiles from '../../../support/fragments/data_import/job_profiles/jobProfiles';
import Logs from '../../../support/fragments/data_import/logs/logs';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import InventoryInstances from '../../../support/fragments/inventory/inventoryInstances';
import InventorySearchAndFilter from '../../../support/fragments/inventory/inventorySearchAndFilter';
import BrowseSubjects from '../../../support/fragments/inventory/search/browseSubjects';
import TopMenu from '../../../support/fragments/topMenu';
import Users from '../../../support/fragments/users/users';
import getRandomPostfix, { randomFourDigitNumber } from '../../../support/utils/stringTools';
import ItemRecordNew from '../../../support/fragments/inventory/item/itemRecordNew';
import ItemRecordView from '../../../support/fragments/inventory/item/itemRecordView';
import ConfirmDeleteItemModal from '../../../support/fragments/inventory/modals/confirmDeleteItemModal';

const testData = {
  inventoryTitle: 'C360405',
  inventorySubject: 'C375163 SuperCorp',
  user: {},
  instanceId: '',
  instanceIDs: [],
  authorityIDs: [],
  newBarCode: getRandomPostfix(),
  item: {
    instanceName: `inventoryC380405_${getRandomPostfix()}`,
    itemBarcode: getRandomPostfix(),
    itemMaterialType: MATERIAL_TYPE_NAMES.ELECTRONIC_RESOURCE,
    itemLoanType: LOAN_TYPE_NAMES.CAN_CIRCULATE,
  },

  marcFiles: [
    {
      marc: 'marcBibC380405.mrc',
      fileName: `testMarcFileC380405.${randomFourDigitNumber()}.mrc`,
      jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
      numberOfRecords: 1,
    },
  ],
};

describe('inventory', () => {
  describe('Subject Browse', () => {
    before('Create test data', () => {
      cy.createTempUser([Permissions.inventoryAll.gui]).then((userProperties) => {
        testData.user = userProperties;
        InventoryInstances.createInstanceViaApi(
          testData.item.instanceName,
          testData.item.itemBarcode,
        );

        InventoryInstances.getInstancesViaApi({
          limit: 100,
          query: `contributors.name="${testData.inventoryTitle}"`,
        }).then((instances) => {
          if (instances) {
            instances.forEach(({ id }) => {
              InventoryInstance.deleteInstanceViaApi(id);
            });
          }
        });
      });
      cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(() => {
        testData.marcFiles.forEach((marcFile) => {
          DataImport.verifyUploadState();
          DataImport.uploadFileAndRetry(marcFile.marc, marcFile.fileName);
          JobProfiles.search(marcFile.jobProfileToRun);
          JobProfiles.runImportFile();
          JobProfiles.waitFileIsImported(marcFile.fileName);
          Logs.checkStatusOfJobProfile(JOB_STATUS_NAMES.COMPLETED);
          Logs.openFileDetails(marcFile.fileName);
          for (let i = 0; i < marcFile.numberOfRecords; i++) {
            Logs.getCreatedItemsID(i).then((link) => {
              testData.instanceIDs.push(link.split('/')[5]);
            });
          }
          cy.visit(TopMenu.dataImportPath);
        });
      });
      cy.logout();
    });

    after('Delete test data', () => {
      cy.getAdminToken();
      Users.deleteViaApi(testData.user.userId);
      InventoryInstances.deleteInstanceAndHoldingRecordAndAllItemsViaApi(testData.item.itemBarcode);
      testData.instanceIDs.forEach((id) => {
        InventoryInstance.deleteInstanceViaApi(id);
      });
    });

    it(
      'C380405 Browse subjects pane remains same results when user switches to search pane and back (spitfire) (TaaS)',
      { tags: ['extendedPath', 'spitfire'] },
      () => {
        cy.login(testData.user.username, testData.user.password, {
          path: TopMenu.inventoryPath,
          waiter: InventoryInstances.waitContentLoading,
        });
        InventorySearchAndFilter.selectBrowseSubjects();
        InventorySearchAndFilter.browseSubjectsSearch(testData.inventorySubject);
        BrowseSubjects.checkValueIsBold(testData.inventorySubject);

        InventorySearchAndFilter.switchToSearchTab();
        InventorySearchAndFilter.switchToInstance();
        InventorySearchAndFilter.searchInstanceByTitle(testData.item.instanceName);
        InventoryInstance.waitLoading();

        InventoryInstance.addItem();
        ItemRecordNew.fillItemRecordFields({
          barcode: testData.newBarCode,
          materialType: testData.item.itemMaterialType,
          loanType: testData.item.itemLoanType,
        });
        ItemRecordNew.saveAndClose();
        InventoryInstance.openHoldingsAccordion(LOCATION_NAMES.MAIN_LIBRARY_UI);
        InventoryInstance.checkIsItemCreated(testData.newBarCode);

        InventoryInstance.openItemByBarcode(testData.newBarCode);
        ItemRecordView.waitLoading();

        ItemRecordView.clickDeleteButton();
        ConfirmDeleteItemModal.clickDeleteButton();
        InventoryInstance.verifyItemBarcode(testData.newBarCode, false);

        InventorySearchAndFilter.switchToBrowseTab();
        BrowseSubjects.verifySearchValue(testData.inventorySubject);
        BrowseSubjects.checkValueIsBold(testData.inventorySubject);
      },
    );
  });
});
