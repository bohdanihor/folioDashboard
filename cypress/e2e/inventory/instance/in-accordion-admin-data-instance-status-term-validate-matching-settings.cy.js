import { DevTeams, TestTypes, Permissions } from '../../../support/dictionary';
import TopMenu from '../../../support/fragments/topMenu';
import InventoryInstances from '../../../support/fragments/inventory/inventoryInstances';
import InventoryInstance from '../../../support/fragments/inventory/inventoryInstance';
import SettingsMenu from '../../../support/fragments/settingsMenu';
import InstanceRecordView from '../../../support/fragments/inventory/instanceRecordView';
import InstanceRecordEdit from '../../../support/fragments/inventory/instanceRecordEdit';
import Users from '../../../support/fragments/users/users';
import InstanceStatusTypes from '../../../support/fragments/settings/inventory/instances/instanceStatusTypes/instanceStatusTypes';
import StatisticalCodes from '../../../support/fragments/settings/inventory/instance-holdings-item/statisticalCodes';

describe('inventory', () => {
  describe('Instance', () => {
    const testData = {};

    before('create test data and login', () => {
      cy.createTempUser([
        Permissions.inventoryAll.gui,
        Permissions.uiSettingsInstanceStatusesCreateEditDelete.gui,
        Permissions.uiSettingsStatisticalCodesCreateEditDelete.gui,
      ]).then((userProperties) => {
        testData.user = userProperties;

        InventoryInstance.createInstanceViaApi().then(({ instanceData }) => {
          testData.instance = instanceData;
        });
      });
    });

    beforeEach('login', () => {
      cy.login(testData.user.username, testData.user.password, {
        path: TopMenu.inventoryPath,
        waiter: InventoryInstances.waitContentLoading,
      });
    });

    after('Delete test data', () => {
      cy.getAdminToken().then(() => {
        InventoryInstance.deleteInstanceViaApi(testData.instance.instanceId);
        Users.deleteViaApi(testData.user.userId);
      });
    });

    it(
      'C602 In Accordion Administrative Data --> Instance status term --> (Validate matching settings) (folijet)',
      { tags: [TestTypes.extended, DevTeams.folijet] },
      () => {
        InventoryInstance.searchByTitle(testData.instance.instanceTitle);
        InventoryInstances.selectInstance();
        InstanceRecordView.verifyInstancePaneExists();
        InstanceRecordView.edit();
        InstanceRecordEdit.waitLoading();
        InstanceRecordEdit.getStatusTermsFromInstance().then((statusNames) => {
          cy.visit(SettingsMenu.instanceStatusTypesPath);
          InstanceStatusTypes.verifyListOfStatusTypesIsIdenticalToListInInstance(statusNames);
        });
      },
    );

    it(
      'C604 In Accordion Administrative Data --> Go to the Statistical code --> (Validate matching settings) (folijet)',
      { tags: [TestTypes.extended, DevTeams.folijet] },
      () => {
        InventoryInstance.searchByTitle(testData.instance.instanceTitle);
        InventoryInstances.selectInstance();
        InstanceRecordView.verifyInstancePaneExists();
        InstanceRecordView.edit();
        InstanceRecordEdit.waitLoading();
        InstanceRecordEdit.addStatisticalCode();
        InstanceRecordEdit.getStatisticalCodesFromInstance().then((codes) => {
          cy.visit(SettingsMenu.statisticalCodesPath);
          StatisticalCodes.verifyListOfStatisticalCodesIsIdenticalToListInInstance(codes);
        });
      },
    );
  });
});
