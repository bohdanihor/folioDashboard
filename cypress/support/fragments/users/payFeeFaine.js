import { Button, HTML, matching, Modal, TextField, including } from '../../../../interactors';

const rootModal = Modal({ id: 'payment-modal' });
const confirmationModal = Modal('Confirm fee/fine payment');
const amountTextfield = rootModal.find(TextField({ id:'amount' }));

export default {
  waitLoading:() => {
    cy.expect(rootModal.exists());
  },
  checkAmount:(amount) => cy.expect(amountTextfield.has({ value: amount.toFixed(2) })),
  setPaymentMethod: ({ name: paymentMethodName }) => cy.get('div[class^=modal-] select[name=method]').select(paymentMethodName),
  submit: () => cy.do(rootModal.find(Button({ id:'submit-button' })).click()),
  confirm:() => cy.do(confirmationModal.find(Button({ id: matching('clickable-confirmation-[0-9]+-confirm') })).click()),
  checkPartialPayConfirmation:() => cy.expect(confirmationModal.find(HTML(including('will be partially paid'))).exists),
  setAmount:(amount) => cy.do(amountTextfield.fillIn(amount.toFixed(2))),
  back:() => cy.do(confirmationModal.find(Button({ id: matching('clickable-confirmation-[0-9]+-cancel') })).click()),
  checkRestOfPay:(rest) => cy.expect(rootModal.find(HTML(including(`Remaining amount:\n${rest.toFixed(2)}`))).exists())
};

