import { HTML, including, Link } from '@interactors/html';
import {
  Accordion,
  and,
  Badge,
  Button,
  Checkbox,
  KeyValue,
  ListItem,
  Modal,
  MultiColumnList,
  MultiColumnListCell,
  MultiColumnListRow,
  MultiSelect,
  MultiSelectOption,
  Pane,
  Section,
  Selection,
  SelectionList,
  TextArea,
  TextField,
} from '../../../../interactors';
import DateTools from '../../utils/dateTools';
import NewNote from '../notes/newNote';

const rootSection = Section({ id: 'pane-userdetails' });
const loansSection = rootSection.find(Accordion({ id: 'loansSection' }));
const requestsSection = rootSection.find(Accordion({ id: 'requestsSection' }));
const currentLoansLink = loansSection.find(Link({ id: 'clickable-viewcurrentloans' }));
const returnedLoansSpan = loansSection.find(HTML({ id: 'claimed-returned-count' }));
const userInformationSection = Accordion({ id: 'userInformationSection' });
const patronBlocksSection = Accordion({ id: 'patronBlocksSection' });
const permissionAccordion = Accordion({ id: 'permissionsSection' });
const affiliationsSection = Section({ id: 'affiliationsSection' });
const affiliationsButton = Button({ id: 'accordion-toggle-button-affiliationsSection' });
const requestsAccordion = Accordion({ id: 'requestsSection' });
const openedRequestsLink = requestsAccordion.find(Link({ id: 'clickable-viewopenrequests' }));
const closedRequestsLink = requestsAccordion.find(HTML({ id: 'clickable-viewclosedrequests' }));
const notesSection = Accordion('Notes');
const actionsButton = rootSection.find(Button('Actions'));
const errors = {
  patronHasBlocksInPlace: 'Patron has block(s) in place',
};
const feesFinesAccordion = rootSection.find(Accordion({ id: 'accountsSection' }));
const newNoteButton = notesSection.find(Button({ id: 'note-create-button' }));
const newBlockPane = Pane('New Block');
const saveAndCloseButton = Button({ id: 'patron-block-save-close' });
const cancelButton = Button({ id: 'expirationDate-modal-cancel-btn' });
const keepEditingButton = Button({ id: 'clickable-cancel-editing-confirmation-confirm' });
const closeWithoutSavingButton = Button({ id: 'clickable-cancel-editing-confirmation-cancel' });
const areYouSureModal = Modal('Are you sure?');
const listFeesFines = MultiColumnList({ id: 'list-accounts-history-view-feesfines' });
const createRequestButton = Button('Create request');
const openedFeesFinesLink = feesFinesAccordion.find(Link({ id: 'clickable-viewcurrentaccounts' }));
const closedFeesFinesLink = feesFinesAccordion.find(HTML({ id: 'clickable-viewclosedaccounts' }));

export default {
  errors,

  openPatronBlocks() {
    cy.do(patronBlocksSection.clickHeader());
  },

  patronBlocksAccordionCovered() {
    cy.expect([
      patronBlocksSection
        .find(Button({ id: 'accordion-toggle-button-patronBlocksSection' }))
        .has({ ariaExpanded: 'false' }),
    ]);
  },

  affiliationsAccordionCovered() {
    cy.expect([affiliationsSection.find(affiliationsButton).has({ ariaExpanded: 'false' })]);
  },

  verifyAffiliationsDetails(primaryAffiliations, count, ...details) {
    cy.get('#affiliationsSection')
      .find('li')
      .then(($liElements) => {
        const liCount = $liElements.length;
        expect(liCount).to.be.gte(count);

        const primaryLiElement = $liElements.filter('[class^="primary-"]');
        expect(primaryLiElement).to.have.lengthOf(1);

        const text = primaryLiElement.text().trim();
        expect(text).to.equal(primaryAffiliations);

        details.forEach((detail) => {
          const detailElement = $liElements.filter(`:contains("${detail}")`);
          expect(detailElement).to.have.lengthOf.at.least(1);
        });
      });
    cy.wait(4000);
  },

  verifyAffiliationsQuantity(quantity) {
    cy.expect(affiliationsSection.find(Badge()).has({ value: quantity }));
  },

  varifyUserCardOpened() {
    cy.expect(Section({ id: 'pane-userdetails' }).exists());
    cy.wait(6000);
  },

  expandAffiliationsAccordion() {
    cy.do(affiliationsSection.find(affiliationsButton).click());
  },

  affiliationsAccordionIsAbsent() {
    cy.expect(affiliationsSection.absent());
  },

  expandLoansSection(openLoans, returnedLoans) {
    cy.do(loansSection.clickHeader());

    return openLoans && this.verifyQuantityOfOpenAndClaimReturnedLoans(openLoans, returnedLoans);
  },
  expandNotesSection({ details = '' } = {}) {
    cy.do(notesSection.clickHeader());

    return details && this.verifyNoteDetails({ details });
  },
  expandRequestsSection(openRequests, closedRequests) {
    cy.do(requestsAccordion.clickHeader());

    return openRequests && this.verifyQuantityOfOpenAndClosedRequests(openRequests, closedRequests);
  },
  verifyQuantityOfOpenAndClosedRequests(openRequests, closedRequests) {
    cy.expect(
      openedRequestsLink.has({
        text: `${openRequests} open requests`,
      }),
    );

    if (closedRequests) {
      cy.expect(
        closedRequestsLink.has({
          text: `${closedRequests} closed request`,
        }),
      );
    }
  },
  verifyNoteDetails({ details = '' } = {}) {
    cy.expect([
      notesSection
        .find(MultiColumnListRow({ index: 0 }).find(MultiColumnListCell({ columnIndex: 1 })))
        .has({ content: and(including(`Title: ${details}`), including(`Details: ${details}`)) }),
      notesSection
        .find(MultiColumnListRow({ index: 0 }).find(MultiColumnListCell({ columnIndex: 2 })))
        .has({ content: 'General note' }),
    ]);
  },
  verifyQuantityOfOpenAndClaimReturnedLoans(openLoans, returnedLoans) {
    cy.expect(currentLoansLink.has({ text: `${openLoans} open loan${openLoans > 1 ? 's' : ''}` }));

    if (returnedLoans) {
      cy.expect(returnedLoansSpan.has({ text: ` (${returnedLoans} claimed returned)` }));
    }
  },
  clickCurrentLoansLink() {
    cy.do(currentLoansLink.click());
  },
  viewCurrentLoans({ openLoans, returnedLoans } = {}) {
    this.expandLoansSection(openLoans, returnedLoans);
    this.clickCurrentLoansLink();
  },
  openFeeFines(openFeesFines, closedFeesFines) {
    cy.do(feesFinesAccordion.clickHeader());

    return (
      openFeesFines && this.verifyQuantityOfOpenAndClosedFeeFines(openFeesFines, closedFeesFines)
    );
  },

  verifyQuantityOfOpenAndClosedFeeFines(openFeesFines, closedFeesFines) {
    cy.expect(
      openedFeesFinesLink.has({
        text: `${openFeesFines} open fee/fine `,
      }),
    );

    if (closedFeesFines) {
      cy.expect(
        closedFeesFinesLink.has({
          text: `${closedFeesFines} closed fee/fine`,
        }),
      );
    }
  },

  openNotesSection() {
    cy.do(Accordion({ id: 'notesAccordion' }).clickHeader());
  },

  openCustomFieldsSection() {
    cy.do(Accordion({ id: 'customFields' }).clickHeader());
  },

  expandRequestSection() {
    cy.do(Accordion({ id: 'requestsSection' }).clickHeader());
    cy.expect([
      Link({ id: 'clickable-viewopenrequests' }).exists(),
      Link({ id: 'clickable-viewclosedrequests' }).exists(),
      createRequestButton.exists(),
    ]);
  },

  verifySponsorsAlphabeticalOrder() {
    cy.do(Accordion({ id: 'proxySection' }).clickHeader());
    cy.get('#proxySection h3 a').then(($elements) => {
      const users = [];
      cy.wrap($elements).each(($el) => {
        users.push($el.text());
      });
      cy.wrap(users).should('equal', users.sort());
    });
  },

  showOpenedLoans() {
    return cy.do(Link({ id: 'clickable-viewcurrentloans' }).click());
  },

  showOpenedFeeFines() {
    return cy.do(Link({ id: 'clickable-viewcurrentaccounts' }).click());
  },

  createPatronBlock() {
    cy.do(Button({ id: 'create-patron-block' }).click());
  },

  verifyNewBlockForm(saveBtnDisabled = true) {
    cy.expect([
      newBlockPane.exists(),
      saveAndCloseButton.has({ disabled: saveBtnDisabled }),
      cancelButton.has({ disabled: false }),
    ]);
  },

  cancelNewBlock() {
    cy.do(cancelButton.click());
    cy.expect([
      areYouSureModal.exists(),
      HTML(including('There are unsaved changes')),
      closeWithoutSavingButton.exists(),
      keepEditingButton.has({ focused: true }),
    ]);
  },

  keepEditingNewBlockForm() {
    cy.do(keepEditingButton.click());
    cy.expect(areYouSureModal.absent());
    this.verifyNewBlockForm(false);
  },

  closeWithoutSavingBlockForm() {
    cy.do(closeWithoutSavingButton.click());
    cy.expect(areYouSureModal.absent());
  },

  verifyCreatedPatronBlock(content) {
    cy.expect([
      newBlockPane.absent(),
      patronBlocksSection
        .find(
          MultiColumnListCell({
            column: 'Display description',
            row: 0,
          }),
        )
        .has({ content }),
    ]);
  },

  openPatronBlockByDescription(text) {
    cy.do(patronBlocksSection.find(MultiColumnListCell(including(text))).click());
  },

  verifyBlockInfo() {
    cy.expect([
      Accordion('Block information'),
      Button('Delete').has({ disabled: false }),
      saveAndCloseButton.has({ disabled: true }),
      cancelButton.has({ disabled: false }),
    ]);
  },

  createAndSaveNewPatronBlock(text) {
    this.openPatronBlocks();
    this.createPatronBlock();
    this.fillDescription(text);
    this.saveAndClose();
  },

  createNewPatronBlock(text) {
    this.openPatronBlocks();
    this.createPatronBlock();
    this.fillDescription(text);
  },

  selectTodayExpirationDate() {
    const today = new Date();
    cy.do(
      TextField({ name: 'expirationDate' }).fillIn(
        DateTools.getFormattedDate({ date: today }, 'YYYY-MM-DD'),
      ),
    );
  },

  openLastUpdatedInfo() {
    cy.do(Accordion({ headline: 'Update information' }).find(Button()).click());
  },

  selectTomorrowExpirationDate() {
    const tomorrow = DateTools.getTomorrowDay();
    cy.do(
      TextField({ name: 'expirationDate' }).fillIn(
        DateTools.getFormattedDate({ date: tomorrow }, 'YYYY-MM-DD'),
      ),
    );
  },

  submitWrongExpirationDate() {
    cy.do(Button('Keep editing').click());
    cy.expect(
      Pane({ id: 'title-patron-block' })
        .find(TextField({ error: 'Expiration date must be in the future' }))
        .exists(),
    );
  },

  submitPatronInformation(text) {
    cy.expect(
      patronBlocksSection
        .find(MultiColumnList({ id: 'patron-block-mcl' }))
        .find(MultiColumnListRow({ index: 0 }))
        .find(MultiColumnListCell({ columnIndex: 1 }))
        .has({ content: text }),
    );
  },

  submitNewBlockPageOpen() {
    cy.expect([
      TextArea({ id: 'patronBlockForm-desc' }).exists(),
      Checkbox({ name: 'borrowing' }).exists,
      Checkbox({ name: 'renewals' }).exists,
      Checkbox({ name: 'requests' }).exists,
    ]);
  },

  closeNewBlockPage() {
    cy.do(Button({ id: 'close-patron-block' }).click());
  },

  selectPatronBlock(text) {
    cy.do(
      patronBlocksSection
        .find(MultiColumnList({ id: 'patron-block-mcl' }))
        .find(MultiColumnListRow({ index: 0 }))
        .find(MultiColumnListCell({ columnIndex: 1, content: text }))
        .click(),
    );
  },

  deletePatronBlock() {
    cy.do([
      Button({ id: 'patron-block-delete' }).click(),
      Button({ id: 'clickable-patron-block-confirmation-modal-confirm' }).click(),
    ]);
  },

  submitThatUserHasPatrons() {
    cy.expect(
      TextField({ id: 'patron-block-place' }).has({ value: 'Patron has block(s) in place' }),
    );
  },

  fillDescription(text) {
    cy.do(TextArea({ name: 'desc' }).fillIn(text));
    cy.expect(saveAndCloseButton.has({ disabled: false }));
  },

  fillDate(date) {
    cy.do(TextField('Expiration date').fillIn(date));
    cy.expect(saveAndCloseButton.has({ disabled: false }));
  },

  selectTemplate(templateName) {
    cy.do([Selection().open(), SelectionList().select(templateName)]);
  },

  saveAndClose() {
    cy.do(saveAndCloseButton.click());
    cy.expect(saveAndCloseButton.absent());
  },

  getApi(userId) {
    return cy
      .okapiRequest({
        method: 'GET',
        path: `users/${userId}`,
      })
      .then(({ body }) => body);
  },

  verifyPermissions(permissions) {
    cy.do(permissionAccordion.clickHeader());
    permissions.forEach((permission) => {
      cy.expect(permissionAccordion.find(HTML(including(permission))).exists());
    });
  },

  verifyPermissionsNotExist(permissions) {
    cy.do(permissionAccordion.clickHeader());
    permissions.forEach((permission) => {
      cy.expect(permissionAccordion.find(HTML(including(permission))).absent());
    });
  },

  waitLoading: () => cy.expect(rootSection.exists()),

  startFeeFine: () => {
    cy.do(actionsButton.click());
    cy.do(Button('Create fee/fine').click());
  },

  startRequest: () => {
    cy.do(actionsButton.click());
    cy.do(createRequestButton.click());
  },

  createNewRequest: () => {
    cy.do(createRequestButton.click());
  },

  startBlock: () => {
    cy.do(actionsButton.click());
    cy.do(Button('Create block').click());
  },

  openTagsPane: () => {
    cy.do(Button({ id: 'clickable-show-tags' }).click());
    cy.expect(Pane('Tags').exists());
    cy.wait(2000);
  },

  addTag: (tag) => {
    cy.do([
      MultiSelect({ id: 'input-tag' }).fillIn(tag),
      MultiSelect({ id: 'input-tag' }).open(),
      MultiSelectOption(including(tag)).click(),
    ]);
  },

  deleteTag: (tag) => {
    cy.do(
      MultiSelect({ id: 'input-tag' })
        .find(Button({ icon: 'times' }))
        .click(),
    );
    cy.expect(
      MultiSelect({ id: 'input-tag' })
        .find(HTML(including(tag)))
        .absent(),
    );
  },

  verifyTagsNumber: (tagsNum) => {
    cy.expect(
      Button({ icon: 'tag' })
        .find(HTML(including(tagsNum)))
        .exists(),
    );
  },

  hasSaveError(errorMessage) {
    cy.expect(rootSection.find(TextField({ value: errorMessage })).exists());
  },
  startFeeFineAdding() {
    cy.do(feesFinesAccordion.find(Button('Create fee/fine')).click());
  },
  startRequestAdding() {
    cy.do(requestsSection.find(Button('Create request')).click());
  },
  viewAllFeesFines() {
    cy.do(feesFinesAccordion.find(Button({ id: 'clickable-viewallaccounts' })).click());
  },
  viewAllClosedFeesFines() {
    cy.do(feesFinesAccordion.find(Button({ id: 'clickable-viewclosedaccounts' })).click());
  },
  verifyPatronBlockValue(value = '') {
    cy.expect(KeyValue('Patron group').has({ value: including(value) }));
  },

  verifySingleSelectValue({ data }) {
    cy.expect(KeyValue(data.fieldLabel).has({ value: including(data.firstLabel) }));
  },

  verifyExpirationDate(date) {
    // js date object
    const formattedDate = DateTools.getFormattedDateWithSlashes({ date });
    cy.expect(KeyValue('Expiration date').has({ value: formattedDate }));
  },

  openContactInfo() {
    cy.do(Accordion('Contact information').clickHeader());
  },

  verifyEmail(email) {
    cy.expect(KeyValue('Email').has({ value: email }));
  },

  verifyFeesFinesCount(count) {
    cy.expect(feesFinesAccordion.find(Badge()).has({ text: count }));
  },

  verifyOpenedFeeFines(count, totalAmount) {
    cy.expect(
      feesFinesAccordion.find(ListItem(including('open'))).has({
        text: including(`${count.toString()} open` && `Total: $${totalAmount.toString()}`),
      }),
    );
  },

  clickNewNoteButton() {
    cy.do(newNoteButton.click());
    NewNote.verifyNewNoteIsDisplayed();
  },

  openNoteForEdit(noteTitle) {
    cy.do(MultiColumnListCell(including(noteTitle)).find(Button('Edit')).click());
  },

  selectFeeFines(feeFines) {
    cy.do([listFeesFines.find(MultiColumnListCell(including(feeFines))).click()]);
  },

  verifyUserInformationPresence() {
    cy.expect(userInformationSection.exists());
  },
};
