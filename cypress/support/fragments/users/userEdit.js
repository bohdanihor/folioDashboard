import { v4 as uuidv4 } from 'uuid';
import { HTML, including } from '@interactors/html';
import {
  Pane,
  Button,
  Accordion,
  TextField,
  MultiColumnListRow,
  Checkbox,
  Modal,
  MultiColumnList,
  Select,
  Section,
  MultiSelect,
  TextArea,
  RadioButtonGroup,
  RadioButton,
  SearchField,
  MultiColumnListCell,
} from '../../../../interactors';
import TopMenu from '../topMenu';
import defaultUser from './userDefaultObjects/defaultUser';
import SelectUser from '../check-out-actions/selectUser';

const permissionsList = MultiColumnList({ id: '#list-permissions' });
const saveAndCloseBtn = Button('Save & close');
const actionsButton = Button('Actions');
const userDetailsPane = Pane({ id: 'pane-userdetails' });
const editButton = Button('Edit');
const extendedInformationAccordion = Accordion('Extended information');
const externalSystemIdTextfield = TextField('External system ID');
const customFieldsAccordion = Accordion('Custom fields');
const selectPermissionsModal = Modal('Select Permissions');
const permissionsAccordion = Accordion({ id: 'permissions' });
const addPermissionsButton = Button({ id: 'clickable-add-permission' });
const permissionsSearch = selectPermissionsModal.find(SearchField());
const searchButton = Button('Search');
const resetAllButton = Button('Reset all');
const selectRequestType = Select({ id: 'type' });
const cancelButton = Button('Cancel');
let totalRows;

// servicePointIds is array of ids
const addServicePointsViaApi = (servicePointIds, userId, defaultServicePointId) => cy.okapiRequest({
  method: 'POST',
  path: 'service-points-users',
  body: {
    id: uuidv4(),
    userId,
    servicePointsIds: servicePointIds,
    defaultServicePointId: defaultServicePointId || servicePointIds[0],
  },
});

export default {
  addServicePointsViaApi,

  openEdit() {
    cy.do([userDetailsPane.find(actionsButton).click(), editButton.click()]);
  },

  changeMiddleName(midName) {
    cy.do(TextField({ id: 'adduser_middlename' }).fillIn(midName));
  },

  changePreferredFirstName(prefName) {
    cy.do(TextField({ id: 'adduser_preferredname' }).fillIn(prefName));
  },

  searchForPermission(permission) {
    cy.do(permissionsSearch.fillIn(permission));
    cy.expect(permissionsSearch.is({ value: permission }));
    cy.do(searchButton.click());
  },

  selectFirsPermissionInSearch() {
    cy.do(MultiColumnListRow({ index: 0 }).find(Checkbox()).click());
  },

  savePermissionsInModal() {
    cy.do(selectPermissionsModal.find(saveAndCloseBtn).click());
  },

  saveUserEditForm() {
    cy.do(Button({ id: 'clickable-save' }).click());
  },

  openSelectPermissionsModal() {
    cy.do(permissionsAccordion.clickHeader());
    cy.do(addPermissionsButton.click());
    cy.expect(selectPermissionsModal.exists());
  },

  addPermissions(permissions) {
    this.openEdit();
    this.openSelectPermissionsModal();
    cy.wrap(permissions).each((permission) => {
      this.searchForPermission(permission);
      cy.do(MultiColumnListRow({ index: 0 }).find(Checkbox()).click());
      cy.wait(2000);
    });
    cy.do(selectPermissionsModal.find(saveAndCloseBtn).click());
  },

  verifyPermissionDoesNotExistInSelectPermissions(permission) {
    this.searchForPermission(permission);
    cy.expect(selectPermissionsModal.find(HTML('The list contains no items')).exists());
  },

  cancelSelectPermissionsModal() {
    cy.do(selectPermissionsModal.find(cancelButton).click());
  },

  addServicePoints(...points) {
    cy.do([
      Button({ id: 'accordion-toggle-button-servicePoints' }).click(),
      Button({ id: 'add-service-point-btn' }).click(),
    ]);

    points.forEach((point) => {
      cy.do(MultiColumnListRow({ content: point, isContainer: true }).find(Checkbox()).click());
    });

    cy.do(Modal().find(saveAndCloseBtn).click());
  },

  addProxySponsor(users, type = 'sponsor') {
    cy.do(Button({ id: 'accordion-toggle-button-proxy' }).click());
    cy.wrap(users).each((username) => {
      cy.do(Button({ id: `clickable-plugin-find-${type}` }).click());
      SelectUser.searchUser(username);
      SelectUser.selectUserFromList(username);
    });
  },

  verifySaveAndColseIsDisabled: (status) => {
    cy.expect(saveAndCloseBtn.has({ disabled: status }));
  },

  verifyCancelIsDisable: (status) => {
    cy.expect(cancelButton.has({ disabled: status }));
  },

  verifyUserInformation: (allContentToCheck) => {
    return allContentToCheck.forEach((contentToCheck) => cy.expect(Section({ id: 'editUserInfo' }, including(contentToCheck)).exists()));
  },

  cancelChanges() {
    cy.do([Button('Cancel').click(), Button('Close without saving').click()]);
  },

  saveAndClose() {
    cy.do(saveAndCloseBtn.click());
  },

  addServicePointViaApi: (servicePointId, userId, defaultServicePointId) => addServicePointsViaApi([servicePointId], userId, defaultServicePointId),

  // we can remove the service point if it is not Preference
  changeServicePointPreference: (userName = defaultUser.defaultUiPatron.body.userName) => {
    cy.visit(TopMenu.usersPath);
    cy.do([
      TextField({ id: 'input-user-search' }).fillIn(userName),
      Button('Search').click(),
      MultiColumnList().click({ row: 0, column: 'Active' }),
      userDetailsPane.find(actionsButton).click(),
      Button({ id: 'clickable-edituser' }).click(),
      Button({ id: 'accordion-toggle-button-servicePoints' }).click(),
      Select({ id: 'servicePointPreference' }).choose('None'),
      Button({ id: 'clickable-save' }).click(),
    ]);
  },

  changeServicePointPreferenceViaApi: (userId, servicePointIds, defaultServicePointId = null) => cy
    .okapiRequest({
      method: 'GET',
      path: `service-points-users?query="userId"="${userId}"`,
      isDefaultSearchParamsRequired: false,
    })
    .then((servicePointsUsers) => {
      cy.okapiRequest({
        method: 'PUT',
        path: `service-points-users/${servicePointsUsers.body.servicePointsUsers[0].id}`,
        body: {
          userId,
          servicePointsIds: servicePointIds,
          defaultServicePointId,
        },
        isDefaultSearchParamsRequired: false,
      });
    }),

  updateExternalIdViaApi(user, externalSystemId) {
    cy.updateUser({
      ...user,
      externalSystemId,
    });
  },

  addExternalId(externalId) {
    cy.do([
      userDetailsPane.find(actionsButton).click(),
      editButton.click(),
      extendedInformationAccordion.click(),
      extendedInformationAccordion.find(externalSystemIdTextfield).fillIn(externalId),
    ]);
    this.saveAndClose();
  },

  addMultiSelectCustomField(data) {
    cy.do([
      userDetailsPane.find(actionsButton).click(),
      editButton.click(),
      customFieldsAccordion.click(),
      customFieldsAccordion.find(MultiSelect({ label: data.fieldLabel })).choose(data.label1),
      customFieldsAccordion.find(MultiSelect({ label: data.fieldLabel })).choose(data.label2),
    ]);
    this.saveAndClose();
  },

  addCustomField(customFieldName, customFieldText) {
    cy.do([
      userDetailsPane.find(actionsButton).click(),
      editButton.click(),
      customFieldsAccordion.click(),
      customFieldsAccordion.find(TextArea({ label: customFieldName })).fillIn(customFieldText),
    ]);
    this.saveAndClose();
  },

  verifyTextFieldPresented(fieldData) {
    cy.expect(TextField(fieldData.fieldLabel).exists());
    cy.do(
      TextField(fieldData.fieldLabel)
        .find(Button({ ariaLabel: 'info' }))
        .click(),
    );
    cy.expect(HTML(fieldData.helpText).exists());
  },

  verifyAreaFieldPresented(fieldData) {
    cy.expect(TextArea(fieldData.fieldLabel).exists());
    cy.do(
      customFieldsAccordion
        .find(TextArea(fieldData.fieldLabel))
        .find(Button({ ariaLabel: 'info' }))
        .click(),
    );
    cy.expect(HTML(fieldData.helpText).exists());
  },

  verifyCheckboxPresented(fieldData) {
    cy.expect(customFieldsAccordion.find(Checkbox(fieldData.fieldLabel)).exists());
    cy.do(
      customFieldsAccordion
        .find(Checkbox(fieldData.fieldLabel))
        .find(Button({ ariaLabel: 'info' }))
        .click(),
    );
    cy.expect(HTML(fieldData.helpText).exists());
  },

  verifyRadioButtonPresented(fieldData) {
    cy.expect(RadioButtonGroup({ label: including(fieldData.data.fieldLabel) }).exists());
    cy.expect(
      customFieldsAccordion
        .find(RadioButtonGroup(including(fieldData.data.fieldLabel)))
        .find(RadioButton(fieldData.data.label1))
        .exists(),
    );
    cy.expect(
      customFieldsAccordion
        .find(RadioButtonGroup(including(fieldData.data.fieldLabel)))
        .find(RadioButton(fieldData.data.label2))
        .exists(),
    );
    cy.do(
      customFieldsAccordion
        .find(RadioButtonGroup(fieldData.data.fieldLabel))
        .find(Button({ ariaLabel: 'info' }))
        .click(),
    );
    cy.expect(HTML(fieldData.data.helpText).exists());
  },

  verifySingleSelectPresented({ data }) {
    cy.do(
      Accordion('Custom fields')
        .find(Select({ label: data.fieldLabel }))
        .exists(),
    );
    cy.do(
      Accordion('Custom fields')
        .find(Select({ label: data.fieldLabel }))
        .find(Button({ ariaLabel: 'info' }))
        .click(),
    );
    cy.expect(HTML(data.helpText).exists());
  },

  selectSingleSelectValue: ({ data }) => {
    cy.do(Select({ label: data.fieldLabel }).choose(data.firstLabel));
  },

  chooseRequestType(requestType) {
    cy.do(selectRequestType.choose(requestType));
  },

  verifyUserTypeItems() {
    cy.expect([
      selectRequestType.has({ content: including('Patron') }),
      selectRequestType.has({ content: including('Staff') }),
    ]);
  },

  enterValidValueToCreateViaUi: (userData) => {
    return cy
      .do([
        TextField({ id: 'adduser_lastname' }).fillIn(userData.personal.lastName),
        Select({ id: 'adduser_group' }).choose(userData.patronGroup),
        TextField({ name: 'barcode' }).fillIn(userData.barcode),
        TextField({ name: 'username' }).fillIn(userData.username),
        TextField({ id: 'adduser_email' }).fillIn(userData.personal.email),
        saveAndCloseBtn.click(),
      ])
      .then(() => {
        cy.intercept('/users').as('user');
        return cy.wait('@user', { timeout: 80000 }).then((xhr) => xhr.response.body.id);
      });
  },

  verifyUserPermissionsAccordion() {
    cy.expect(permissionsAccordion.exists());
    cy.expect(permissionsAccordion.has({ open: false }));
  },

  verifyPermissionsNotExistInPermissionsAccordion(permissions) {
    cy.do(permissionsAccordion.clickHeader());
    permissions.forEach((permission) => {
      cy.expect(permissionsAccordion.find(HTML(including(permission))).absent());
    });
  },

  verifyPermissionsFiltered(permission) {
    permissionsList.perform((el) => {
      el.invoke('attr', 'aria-rowcount').then((rowCount) => {
        for (let i = 0; i < rowCount - 1; i++) {
          const statusField = MultiColumnListCell({ row: i, columnIndex: 1 });
          cy.expect(statusField.has({ content: permission[i] }));
        }
      });
    });
  },

  resetAll() {
    cy.do(resetAllButton.click());
    permissionsList.perform((el) => {
      el.invoke('attr', 'aria-rowcount').then((rowCount) => {
        expect(rowCount).to.equal(totalRows);
      });
    });
  },

  addAddress(type = 'Home') {
    cy.do([Button('Add address').click(), Select('Address Type*').choose(type)]);
  },
};
