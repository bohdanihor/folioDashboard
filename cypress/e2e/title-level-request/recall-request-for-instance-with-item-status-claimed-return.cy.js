import TopMenu from '../../support/fragments/topMenu';
import ServicePoints from '../../support/fragments/settings/tenant/servicePoints/servicePoints';
import InventoryInstances from '../../support/fragments/inventory/inventoryInstances';
import Users from '../../support/fragments/users/users';
import { ITEM_STATUS_NAMES } from '../../support/constants';
import Location from '../../support/fragments/settings/tenant/locations/newLocation';
import TitleLevelRequests from '../../support/fragments/settings/circulation/titleLevelRequests';
import InventorySearchAndFilter from '../../support/fragments/inventory/inventorySearchAndFilter';
import NewRequest from '../../support/fragments/requests/newRequest';
import Permissions from '../../support/dictionary/permissions';
import SettingsMenu from '../../support/fragments/settingsMenu';
import InventoryInstance from '../../support/fragments/inventory/inventoryInstance';
import UserEdit from '../../support/fragments/users/userEdit';
import { DevTeams, TestTypes } from '../../support/dictionary';

describe('Title level request for claimed return item', () => {
  const testData = {
    folioInstances: InventoryInstances.generateFolioInstances({
      status: ITEM_STATUS_NAMES.CLAIMED_RETURNED,
    }),
    servicePoint: ServicePoints.getDefaultServicePointWithPickUpLocation(),
  };
  let userData;
  let defaultLocation;

  before('Create test data', () => {
    cy.getAdminToken();
    ServicePoints.createViaApi(testData.servicePoint);
    defaultLocation = Location.getDefaultLocation(testData.servicePoint.id);
    Location.createViaApi(defaultLocation).then((location) => {
      InventoryInstances.createFolioInstancesViaApi({
        folioInstances: testData.folioInstances,
        location,
      });
    });
    cy.createTempUser([
      Permissions.requestsAll.gui,
      Permissions.uiRequestsEdit.gui,
      Permissions.uiRequestsCreate.gui,
      Permissions.inventoryAll.gui,
      Permissions.checkinAll.gui,
    ]).then((userProperties) => {
      userData = userProperties;
      UserEdit.addServicePointViaApi(
        testData.servicePoint.id,
        userData.userId,
        testData.servicePoint.id,
      );
      cy.loginAsAdmin({
        path: SettingsMenu.circulationTitleLevelRequestsPath,
        waiter: TitleLevelRequests.waitLoading,
      });
      TitleLevelRequests.changeTitleLevelRequestsStatus('allow');
      cy.login(userData.username, userData.password, {
        path: TopMenu.inventoryPath,
        waiter: InventorySearchAndFilter.waitLoading,
      });
    });
  });

  after('Delete test data', () => {
    UserEdit.changeServicePointPreferenceViaApi(userData.userId, [testData.servicePoint.id]);
    ServicePoints.deleteViaApi(testData.servicePoint.id);
    InventoryInstances.deleteInstanceViaApi({
      instance: testData.folioInstances[0],
      servicePoint: testData.servicePoint,
      shouldCheckIn: true,
    });
    Location.deleteViaApiIncludingInstitutionCampusLibrary(
      defaultLocation.institutionId,
      defaultLocation.campusId,
      defaultLocation.libraryId,
      defaultLocation.id,
    );
    Users.deleteViaApi(userData.userId);
  });

  it(
    'C375949 Check that user can not create a TLR Recall for item with status Claimed return',
    { tags: [TestTypes.extendedPath, DevTeams.vega] },
    () => {
      InventorySearchAndFilter.searchInstanceByTitle(testData.folioInstances[0].instanceTitle);
      // Open new request dialog
      InventoryInstance.checkNewRequestAtNewPane();
      NewRequest.verifyTitleLevelRequestsCheckbox('checked');
      // Enter requester barcode
      NewRequest.enterRequesterBarcode(userData.barcode);
      // Error message should be displayed
      NewRequest.verifyErrorMessageForRequestTypeField(
        'None available for this title and patron combination',
      );
    },
  );
});
