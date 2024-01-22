import { HTML, including } from '@interactors/html';
import {
  Button,
  MultiColumnListCell,
  Accordion,
  Selection,
  SelectionList,
  MultiColumnList,
  MultiColumnListRow,
  Checkbox,
  Link,
} from '../../../../../interactors';
import FileDetails from './fileDetails';
import { getLongDelay } from '../../../utils/cypressTools';

const anyProfileAccordion = Accordion({ id: 'profileIdAny' });
const runningAccordion = Accordion('Running');
const actionsButton = Button('Actions');
const viewAllLogsButton = Button('View all logs');
const selectAllCheckbox = Checkbox({ name: 'selected-all' });
const searchResultList = MultiColumnList({ id: 'search-results-list' });
const deleteSelectedLogsButton = Button('Delete selected logs');
const times = Button({ icon: 'times' });
const visitedLinkColor = 'rgb(47, 96, 159)';

const quantityRecordsInInvoice = {
  firstQuantity: '18',
};

const actionsButtonClick = () => cy.do(actionsButton.click());
const viewAllLogsButtonClick = () => cy.do(viewAllLogsButton.click());
const selectAllLogs = () => cy.do(MultiColumnList({ id: 'job-logs-list' }).find(selectAllCheckbox).click());
const deleteLogsButtonClick = () => cy.do(deleteSelectedLogsButton.click());

export default {
  quantityRecordsInInvoice,
  actionsButtonClick,
  viewAllLogsButtonClick,
  selectAllLogs,
  deleteLogsButtonClick,

  openViewAllLogs: () => {
    actionsButtonClick();
    viewAllLogsButtonClick();
  },

  checkImportFile(jobProfileName) {
    cy.do(actionsButton.click());
    cy.do(viewAllLogsButton.click());
    cy.do([
      anyProfileAccordion.clickHeader(),
      anyProfileAccordion.find(Selection({ singleValue: including('Choose job profile') })).open(),
    ]);
    cy.do(SelectionList().select(jobProfileName));
    cy.expect(MultiColumnListCell(jobProfileName).exists());
  },

  checkStatusOfJobProfile: (status = 'Completed', rowNumber = 0) => cy.do(MultiColumnListCell({ row: rowNumber, content: status }).exists()),

  checkJobStatus: (fileName, status) => {
    cy.do(
      MultiColumnListCell({ content: fileName }).perform((element) => {
        const rowNumber = element.parentElement.getAttribute('data-row-inner');

        cy.expect(
          MultiColumnList({ id: 'job-logs-list' })
            .find(MultiColumnListRow({ indexRow: `row-${rowNumber}` }))
            .find(MultiColumnListCell({ content: status }))
            .exists(),
        );
      }),
    );
  },

  openFileDetails: (fileName) => {
    cy.do(Link(fileName).click());
    FileDetails.verifyLogDetailsPageIsOpened(fileName);
    FileDetails.verifyResultsListIsVisible();
    // TODO need to wait until page is uploaded
    cy.wait(3500);
  },
  checkQuantityRecordsInFile: (quantityRecords) => cy.do(MultiColumnListCell({ row: 0, content: quantityRecords }).exists()),

  clickOnHotLink: (row = 0, columnIndex = 3, status = 'Created') => {
    cy.do(
      searchResultList.find(MultiColumnListCell({ row, columnIndex })).find(Link(status)).click(),
    );
  },

  verifyInstanceStatus: (row = 0, columnIndex = 3, status = 'Created') => {
    cy.do(
      searchResultList.find(MultiColumnListCell({ row, columnIndex, content: status })).exists(),
    );
  },

  goToTitleLink: (title) => {
    // When you click on a link, it opens in a new tab. Because of this, a direct transition to the link is carried out.
    cy.do(
      searchResultList.find(Link(title)).perform((element) => {
        cy.visit(element.href);
      }),
    );
  },

  checkAuthorityLogJSON: (propertiesArray) => {
    cy.do(Button('Authority').click());

    propertiesArray.forEach((property) => {
      cy.expect(HTML(property).exists());
    });
  },

  getCreatedItemsID: (rowIndex = 0) => cy.then(() => searchResultList
    .find(MultiColumnListRow({ indexRow: `row-${rowIndex}` }))
    .find(Link('Created'))
    .href()),

  checkFileIsRunning: (fileName) => cy.expect(runningAccordion.find(HTML(including(fileName))).exists()),
  verifyCheckboxForMarkingLogsAbsent: () => cy.expect(MultiColumnList({ id: 'job-logs-list' }).find(selectAllCheckbox).absent()),
  verifyDeleteSelectedLogsButtonAbsent: () => cy.expect(deleteSelectedLogsButton.absent()),
  closePane: () => {
    cy.do(times.click());
  },

  verifyFirstFileNameStyle: () => {
    cy.get('#job-logs-list [class*="mclCell-"]:nth-child(1) a')
      .eq(0)
      .should('have.css', 'text-decoration')
      .and('include', 'underline');
  },

  verifyNoFileNameLogAbsent: () => {
    cy.do(
      MultiColumnList({ id: 'job-logs-list' })
        .find(MultiColumnListCell({ row: 0, columnIndex: 0, content: 'No file name' }))
        .absent(),
    );
  },

  verifyFirstFileNameInLogList: (username, fileName) => {
    cy.do(
      MultiColumnListCell({ content: username }).perform((element) => {
        const rowNumber = element.parentElement.getAttribute('data-row-inner');

        cy.expect(
          MultiColumnList({ id: 'job-logs-list' })
            .find(MultiColumnListRow({ indexRow: `row-${rowNumber}` }))
            .find(MultiColumnListCell({ content: fileName }))
            .exists(),
        );
      }),
    );
  },

  clickFirstFileNameCell: () => {
    cy.do(
      MultiColumnList({ id: 'job-logs-list' })
        .find(MultiColumnListCell({ row: 0, columnIndex: 0 }))
        .hrefClick(),
    );
  },

  verifyVisitedLinkColor: () => {
    cy.get('#job-logs-list [class*="mclCell-"]:nth-child(1) a')
      .eq(0)
      .should('have.css', 'color', visitedLinkColor);
  },

  waitFileIsImported: (fileName) => {
    // wait until uploaded file is displayed in the list
    cy.wait(60000);
    cy.expect(runningAccordion.find(HTML(including(fileName))).absent(), getLongDelay());
    cy.expect(
      MultiColumnList({ id: 'job-logs-list' })
        .find(Button(including(fileName)))
        .exists(),
    );
  },
};
