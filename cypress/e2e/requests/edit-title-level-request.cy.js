import uuid from 'uuid';
import TestTypes from '../../support/dictionary/testTypes';
import EditRequest from '../../support/fragments/requests/edit-request';
import TopMenu from '../../support/fragments/topMenu';
import Requests from '../../support/fragments/requests/requests';
import Users from '../../support/fragments/users/users';
import DevTeams from '../../support/dictionary/devTeams';
import Permissions from '../../support/dictionary/permissions';
import ServicePoints from '../../support/fragments/settings/tenant/servicePoints/servicePoints';
import UserEdit from '../../support/fragments/users/userEdit';
import {
  ITEM_STATUS_NAMES,
  REQUEST_TYPES,
  REQUEST_LEVELS,
  FULFILMENT_PREFERENCES,
} from '../../support/constants';
import generateItemBarcode from '../../support/utils/generateItemBarcode';
import getRandomPostfix from '../../support/utils/stringTools';
import Location from '../../support/fragments/settings/tenant/locations/newLocation';
import InventoryInstances from '../../support/fragments/inventory/inventoryInstances';
import DateTools from '../../support/utils/dateTools';
import RequestDetail from '../../support/fragments/requests/requestDetail';

describe('Edit title level request', () => {
  const userData = {};
  const servicePoint1 = ServicePoints.getDefaultServicePointWithPickUpLocation();
  const servicePoint2 = ServicePoints.getDefaultServicePointWithPickUpLocation();
  const itemData = {
    barcode: generateItemBarcode(),
    instanceTitle: `Instance ${getRandomPostfix()}`,
  };
  const patronComments = 'test comment';
  let defaultLocation;
  let requestId;

  const requestData = {
    id: uuid(),
    requestType: REQUEST_TYPES.PAGE,
    requestLevel: REQUEST_LEVELS.TITLE,
    requestDate: new Date().toISOString(),
    fulfillmentPreference: FULFILMENT_PREFERENCES.HOLD_SHELF,
  };

  before('Create New Item and New User', () => {
    cy.getAdminToken()
      .then(() => {
        ServicePoints.createViaApi(servicePoint1);
        ServicePoints.createViaApi(servicePoint2);
        defaultLocation = Location.getDefaultLocation(servicePoint1.id);
        Location.createViaApi(defaultLocation);
        cy.getInstanceTypes({ limit: 1 }).then((instanceTypes) => {
          itemData.instanceTypeId = instanceTypes[0].id;
        });
        cy.getHoldingTypes({ limit: 1 }).then((res) => {
          itemData.holdingTypeId = res[0].id;
        });
        cy.getLoanTypes({ limit: 1 }).then((res) => {
          itemData.loanTypeId = res[0].id;
        });
        cy.getMaterialTypes({ limit: 1 }).then((res) => {
          itemData.materialTypeId = res.id;
          itemData.materialTypeName = res.name;
        });
      })
      .then(() => {
        InventoryInstances.createFolioInstanceViaApi({
          instance: {
            instanceTypeId: itemData.instanceTypeId,
            title: itemData.instanceTitle,
          },
          holdings: [
            {
              holdingsTypeId: itemData.holdingTypeId,
              permanentLocationId: defaultLocation.id,
            },
          ],
          items: [
            {
              barcode: itemData.barcode,
              status: { name: ITEM_STATUS_NAMES.AVAILABLE },
              permanentLoanType: { id: itemData.loanTypeId },
              materialType: { id: itemData.materialTypeId },
            },
          ],
        });
      })
      .then((specialInstanceIds) => {
        itemData.testInstanceIds = specialInstanceIds;
        requestData.instanceId = specialInstanceIds.instanceId;
      })
      .then(() => {
        cy.createTempUser([Permissions.uiRequestsAll.gui])
          .then((userProperties) => {
            userData.username = userProperties.username;
            userData.password = userProperties.password;
            userData.userId = userProperties.userId;
            userData.barcode = userProperties.barcode;
            userData.firstName = userProperties.firstName;
            userData.patronGroup = userProperties.patronGroup;
            userData.fullName = `${userData.username}, ${Users.defaultUser.personal.firstName} ${Users.defaultUser.personal.middleName}`;
          })
          .then(() => {
            cy.wrap(true)
              .then(() => {
                requestData.requesterId = userData.userId;
                requestData.pickupServicePointId = servicePoint1.id;
                requestData.patronComments = patronComments;
              })
              .then(() => {
                Requests.createNewRequestViaApi(requestData).then((createdRequest) => {
                  requestId = createdRequest.body.id;
                });
              });

            UserEdit.addServicePointsViaApi(
              [servicePoint1.id, servicePoint2.id],
              userData.userId,
              servicePoint1.id,
            );

            cy.login(userData.username, userData.password);
          });
      });
  });

  after('Delete New Service point, Item and User', () => {
    cy.getAdminToken();
    Requests.deleteRequestViaApi(requestId);
    InventoryInstances.deleteInstanceAndHoldingRecordAndAllItemsViaApi(itemData.barcode);
    UserEdit.changeServicePointPreferenceViaApi(userData.userId, [servicePoint1.id]);
    Users.deleteViaApi(userData.userId);
    Location.deleteViaApiIncludingInstitutionCampusLibrary(
      defaultLocation.institutionId,
      defaultLocation.campusId,
      defaultLocation.libraryId,
      defaultLocation.id,
    );
    ServicePoints.deleteViaApi(servicePoint1.id);
    ServicePoints.deleteViaApi(servicePoint2.id);
  });

  it(
    'C350559 Check that the user can Edit request (Title level request) (vega)',
    { tags: [TestTypes.criticalPath, DevTeams.vega] },
    () => {
      cy.visit(TopMenu.requestsPath);
      Requests.selectNotYetFilledRequest();
      Requests.findCreatedRequest(itemData.barcode);
      Requests.selectTheFirstRequest();

      EditRequest.openRequestEditForm();
      EditRequest.waitLoading('title');
      EditRequest.verifyTitleInformation({
        titleLevelRequest: '1',
        title: itemData.instanceTitle,
      });
      EditRequest.verifyRequesterInformation({
        userFullName: userData.fullName,
        userBarcode: userData.barcode,
        requesterPatronGroup: userData.patronGroup,
      });
      EditRequest.verifyRequestInformation({
        requestType: requestData.requestType,
        requestStatus: EditRequest.requestStatuses.NOT_YET_FILLED,
        patronComments: requestData.patronComments,
      });
      const currentDate = new Date();
      EditRequest.setExpirationDate(DateTools.getFormattedDate({ date: currentDate }));
      EditRequest.setPickupServicePoint(servicePoint2.name);
      EditRequest.saveAndClose();

      RequestDetail.waitLoading('no staff');
      RequestDetail.checkTitleInformation({
        TLRs: '1',
        title: itemData.instanceTitle,
      });
      RequestDetail.checkItemInformation({
        itemBarcode: itemData.barcode,
        title: itemData.instanceTitle,
        effectiveLocation: defaultLocation.name,
        itemStatus: ITEM_STATUS_NAMES.PAGED,
        requestsOnItem: '1',
      });
      RequestDetail.checkRequestInformation({
        type: requestData.requestType,
        status: EditRequest.requestStatuses.NOT_YET_FILLED,
        level: requestData.requestLevel,
        requestExpirationDate: DateTools.getFormattedDate({ date: currentDate }, 'MM/DD/YYYY'),
        comments: requestData.patronComments,
      });
      RequestDetail.checkRequesterInformation({
        lastName: userData.fullName,
        barcode: userData.barcode,
        group: userData.patronGroup,
        preference: requestData.fulfillmentPreference,
        pickupSP: servicePoint2.name,
      });
    },
  );
});
