import { HTML, including, Link } from '@interactors/html';

import {
  Button,
  Callout,
  Modal,
  MultiColumnListCell,
  MultiColumnListRow,
  Pane,
} from '../../../../../../interactors';
import SettingsPane, { rootPane } from '../../settingsPane';
import LocationDetails from '../locations/locationDetails';
import { randomFourDigitNumber } from '../../../../utils/stringTools';

const addButton = Button('New');
const deleteAddressButton = Button({ id: including('clickable-delete-addresses') });
const deleteAddressModal = Modal('Delete address');
const cancelButtonInDeleteAdressModal = deleteAddressModal.find(Button('Cancel'));
const deleteButtonInDeleteAdressModal = deleteAddressModal.find(Button('Delete'));
const deleteCalloutMessage = ['The address', 'was successfully', 'deleted'];

export default {
  ...SettingsPane,
  rootPane,
  waitLoading() {
    cy.expect(Pane('Addresses').exists());
  },
  openLastUpdated(name) {
    cy.do(
      MultiColumnListRow(including(name))
        .find(MultiColumnListCell({ columnIndex: 2 }))
        .find(Link({ href: including('/users/view') }))
        .click(),
    );
  },
  checkNoActionButtons() {
    cy.expect(addButton.absent());
    LocationDetails.checkActionButtonAbsent();
  },
  verifyNoPermissionWarning() {
    cy.expect(HTML("You don't have permission to view this app/record").exists());
  },
  setAddress(body) {
    return cy
      .okapiRequest({
        method: 'POST',
        path: 'configurations/entries',
        body: {
          module: `TENANT_${randomFourDigitNumber()}`,
          configName: 'tenant.addresses',
          value: JSON.stringify(body),
        },
        isDefaultSearchParamsRequired: false,
      })
      .then((response) => {
        return response.body;
      });
  },
  deleteAddress(addressId) {
    return cy.okapiRequest({
      path: `configurations/entries/${addressId}`,
      method: 'DELETE',
    });
  },
  clickDeleteButtonForAddressValue(addressValue) {
    cy.do(MultiColumnListRow(including(addressValue)).find(deleteAddressButton).click());
  },
  verifyDeleteModalDisplayed() {
    cy.expect(deleteAddressModal.exists());
    cy.expect(cancelButtonInDeleteAdressModal.has({ disabled: false }));
    cy.expect(deleteButtonInDeleteAdressModal.has({ disabled: false }));
  },
  verifyDeleteModalIsNotDisplayed() {
    cy.expect(deleteAddressModal.absent());
  },
  clickDeleteButtonInDeleteModal() {
    cy.do(deleteButtonInDeleteAdressModal.click());
  },
  clickCancelButtonInDeleteModal() {
    cy.do(cancelButtonInDeleteAdressModal.click());
  },
  verifyCalloutForAddressDeletionAppears() {
    cy.expect(Callout({ textContent: including(deleteCalloutMessage[0]) }).exists());
    cy.expect(Callout({ textContent: including(deleteCalloutMessage[1]) }).exists());
    cy.expect(Callout({ textContent: including(deleteCalloutMessage[2]) }).exists());
  },
  addressRowWithValueIsAbsent(addressValue) {
    cy.expect(MultiColumnListRow(including(addressValue)).absent());
  },
};
