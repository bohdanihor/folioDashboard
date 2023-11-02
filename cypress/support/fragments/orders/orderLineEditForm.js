import {
  Button,
  Section,
  Select,
  Selection,
  SelectionList,
  TextArea,
  TextField,
  including,
  matching,
} from '../../../../interactors';
import OrderStates from './orderStates';
import InteractorsTools from '../../utils/interactorsTools';

const orderLineEditFormRoot = Section({ id: 'pane-poLineForm' });
const itemDetailsSection = orderLineEditFormRoot.find(Section({ id: 'itemDetails' }));
const orderLineDetailsSection = orderLineEditFormRoot.find(Section({ id: 'lineDetails' }));
const costDetailsSection = orderLineEditFormRoot.find(Section({ id: 'costDetails' }));
const locationSection = orderLineEditFormRoot.find(Section({ id: 'location' }));

const cancelButtom = Button('Cancel');
const saveButtom = Button('Save & close');

const itemDetailsFields = {
  receivingNote: itemDetailsSection.find(TextArea({ name: 'details.receivingNote' })),
};

const orderLineFields = {
  orderFormat: orderLineDetailsSection.find(Select({ name: 'orderFormat' })),
  receiptStatus: orderLineDetailsSection.find(Select({ name: 'receiptStatus' })),
  paymentStatus: orderLineDetailsSection.find(Select({ name: 'paymentStatus' })),
};

const costDetailsFields = {
  physicalUnitPrice: costDetailsSection.find(TextField({ name: 'cost.listUnitPrice' })),
  quantityPhysical: costDetailsSection.find(TextField({ name: 'cost.quantityPhysical' })),
};

const buttons = {
  Cancel: cancelButtom,
  'Save & close': saveButtom,
};

export default {
  waitLoading() {
    cy.expect(orderLineEditFormRoot.exists());
  },
  checkButtonsConditions(fields = []) {
    fields.forEach(({ label, conditions }) => {
      cy.expect(buttons[label].has(conditions));
    });
  },
  fillOrderLineFields(orderLine) {
    if (orderLine.itemDetails) {
      this.fillItemDetails(orderLine.itemDetails);
    }
    if (orderLine.poLineDetails) {
      this.fillPoLineDetails(orderLine.poLineDetails);
    }
    if (orderLine.costDetails) {
      this.fillCostDetails(orderLine.costDetails);
    }
    if (orderLine.locationDetails) {
      this.fillLocationDetails(orderLine.locationDetails);
    }
    if (orderLine.receiptStatus) {
      cy.do(orderLineFields.receiptStatus.choose(orderLine.receiptStatus));
    }
    if (orderLine.paymentStatus) {
      cy.do(orderLineFields.paymentStatus.choose(orderLine.paymentStatus));
    }
  },
  fillItemDetails(itemDetails) {
    Object.entries(itemDetails).forEach(([key, value]) => {
      cy.do(itemDetailsFields[key].fillIn(value));
    });
  },
  fillPoLineDetails(poLineDetails) {
    if (poLineDetails.orderFormat) {
      cy.do(orderLineFields.orderFormat.choose(poLineDetails.orderFormat));
    }
  },
  fillCostDetails(costDetails) {
    Object.entries(costDetails).forEach(([key, value]) => {
      cy.do(costDetailsFields[key].fillIn(value));
    });
  },
  fillLocationDetails(locationDetails) {
    locationDetails.forEach((location, index) => {
      Object.entries(location).forEach(([key, value]) => {
        cy.do(
          locationSection.find(TextField({ name: `locations[${index}].${key}` })).fillIn(value),
        );
      });
    });
  },
  addFundDistribution() {
    cy.do(Button('Add fund distribution').click());
  },
  selectDropDownValue(label, option) {
    cy.do([
      Selection(including(label)).open(),
      SelectionList().filter(option),
      SelectionList().select(including(option)),
    ]);
  },
  selectFundDistribution(fund) {
    this.selectDropDownValue('Fund ID', fund);
  },
  selectExpenseClass(expenseClass) {
    this.selectDropDownValue('Expense class', expenseClass);
  },
  checkValidatorError({ locationDetails } = {}) {
    if (locationDetails) {
      cy.expect(
        locationSection
          .find(TextField({ label: including(locationDetails.label) }))
          .has({ error: locationDetails.error }),
      );
    }
  },
  clickCancelButton() {
    cy.do(cancelButtom.click());
    cy.expect(orderLineEditFormRoot.absent());
  },
  clickSaveButton({ orderLineUpdated = true } = {}) {
    cy.expect(saveButtom.has({ disabled: false }));
    cy.do(saveButtom.click());

    if (orderLineUpdated) {
      InteractorsTools.checkCalloutMessage(
        matching(new RegExp(OrderStates.orderLineUpdatedSuccessfully)),
      );
    }
    // wait for changes to be applied
    cy.wait(2000);
  },
};
