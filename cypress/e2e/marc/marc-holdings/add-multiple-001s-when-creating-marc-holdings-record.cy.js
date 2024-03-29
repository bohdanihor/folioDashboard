import Permissions from '../../../support/dictionary/permissions';
import TopMenu from '../../../support/fragments/topMenu';
import DataImport from '../../../support/fragments/data_import/dataImport';
import Users from '../../../support/fragments/users/users';
import QuickMarcEditor from '../../../support/fragments/quickMarcEditor';
import getRandomPostfix from '../../../support/utils/stringTools';
import InventoryInstances from '../../../support/fragments/inventory/inventoryInstances';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import InventorySearchAndFilter from '../../../support/fragments/inventory/inventorySearchAndFilter';
import ServicePoints from '../../../support/fragments/settings/tenant/servicePoints/servicePoints';
import NewLocation from '../../../support/fragments/settings/tenant/locations/newLocation';
import MarcAuthority from '../../../support/fragments/marcAuthority/marcAuthority';
import HoldingsRecordView from '../../../support/fragments/inventory/holdingsRecordView';

const testData = {
  marc: 'marcBibFileC387462.mrc',
  fileName: `testMarcFileC387462.${getRandomPostfix()}.mrc`,
  jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
  propertyName: 'relatedInstanceInfo',
  instanceTitle: 'C387462The Journal of ecclesiastical history.',
  searchOption: 'Keyword (title, contributor, identifier, HRID, UUID)',
};

let instanceId;

describe('MARC', () => {
  describe('MARC Holdings', () => {
    before('Create test data', () => {
      cy.createTempUser([
        Permissions.uiInventoryViewInstances.gui,
        Permissions.uiInventoryViewCreateEditHoldings.gui,
        Permissions.uiQuickMarcQuickMarcHoldingsEditorCreate.gui,
        Permissions.uiQuickMarcQuickMarcHoldingsEditorAll.gui,
      ]).then((createdUserProperties) => {
        testData.userProperties = createdUserProperties;

        cy.getAdminToken().then(() => {
          ServicePoints.getViaApi({ limit: 1, query: 'name=="Circ Desk 1"' }).then(
            (servicePoint) => {
              testData.servicePointId = servicePoint[0].id;
              NewLocation.createViaApi(
                NewLocation.getDefaultLocation(testData.servicePointId),
              ).then((res) => {
                testData.location = res;
              });
            },
          );
        });

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
      'C387462 Add multiple 001s when creating "MARC Holdings" record (spitfire) (TaaS)',
      { tags: ['extendedPath', 'spitfire'] },
      () => {
        InventoryInstances.searchBySource('MARC');
        InventorySearchAndFilter.selectSearchOptions(testData.searchOption, testData.instanceTitle);
        InventorySearchAndFilter.clickSearch();
        InventoryInstance.selectTopRecord();
        InventoryInstance.goToMarcHoldingRecordAdding();
        QuickMarcEditor.selectExistingHoldingsLocation(testData.location);
        MarcAuthority.checkAddNew001Tag(5, '$a test');
        cy.wait(1000); // wait until redirect marc holding page
        QuickMarcEditor.closeEditorPane();
        InventoryInstance.goToMarcHoldingRecordAdding();
        QuickMarcEditor.selectExistingHoldingsLocation(testData.location);
        MarcAuthority.checkAddNew001Tag(5, '$a test');
        HoldingsRecordView.editInQuickMarc();
        QuickMarcEditor.verifyOnlyOne001FieldAreDisplayed();
      },
    );
  });
});
