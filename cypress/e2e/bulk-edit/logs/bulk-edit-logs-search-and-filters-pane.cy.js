import Permissions from '../../../support/dictionary/permissions';
import BulkEditSearchPane from '../../../support/fragments/bulk-edit/bulk-edit-search-pane';
import TopMenu from '../../../support/fragments/topMenu';
import Users from '../../../support/fragments/users/users';
import DateTools from '../../../support/utils/dateTools';

let user;

describe('Bulk Edit - Logs', () => {
  before('create test data', () => {
    cy.createTempUser([
      Permissions.bulkEditLogsView.gui,
      Permissions.bulkEditCsvView.gui,
      Permissions.bulkEditView.gui,
    ]).then((userProperties) => {
      user = userProperties;
      cy.login(user.username, user.password, {
        path: TopMenu.bulkEditPath,
        waiter: BulkEditSearchPane.waitLoading,
      });
    });
  });

  after('delete test data', () => {
    cy.getAdminToken();
    Users.deleteViaApi(user.userId);
  });

  it(
    'C368033 Filters section: Statuses (firebird) (TaaS)',
    { tags: ['extendedPath', 'firebird'] },
    () => {
      BulkEditSearchPane.openLogsSearch();
      BulkEditSearchPane.verifySetCriteriaPaneExists();
      BulkEditSearchPane.verifyLogsStatusesAccordionExistsAndUnchecked();
      BulkEditSearchPane.clickLogsStatusesAccordion();
      BulkEditSearchPane.verifyLogsStatusesAccordionCollapsed();
      BulkEditSearchPane.clickLogsStatusesAccordion();
      BulkEditSearchPane.verifyLogsStatusesAccordionExistsAndUnchecked();
      const statuses = [
        'New',
        'Retrieving records',
        'Saving records',
        'Data modification',
        'Reviewing changes',
        'Completed',
        'Completed with errors',
        'Failed',
      ];
      statuses.forEach((status) => BulkEditSearchPane.checkLogsCheckbox(status));
      BulkEditSearchPane.resetAllBtnIsDisabled(false);
      BulkEditSearchPane.verifyClearSelectedFiltersButton('Statuses');
      BulkEditSearchPane.clickClearSelectedFiltersButton('Statuses');
      BulkEditSearchPane.verifyLogsPane();
      BulkEditSearchPane.checkLogsCheckbox('Completed');
      BulkEditSearchPane.resetAllBtnIsDisabled(false);
      BulkEditSearchPane.verifyClearSelectedFiltersButton('Statuses');
      BulkEditSearchPane.verifyCellsValues(2, 'Completed');
      BulkEditSearchPane.resetAll();
    },
  );

  it(
    'C368034 Filters section: Record types (firebird) (TaaS)',
    { tags: ['extendedPath', 'firebird'] },
    () => {
      BulkEditSearchPane.openLogsSearch();
      BulkEditSearchPane.verifySetCriteriaPaneExists();
      BulkEditSearchPane.verifyLogsRecordTypesAccordionExistsAndUnchecked();
      BulkEditSearchPane.clickRecordTypesAccordion();
      BulkEditSearchPane.verifyLogsRecordTypesAccordionCollapsed();
      BulkEditSearchPane.clickRecordTypesAccordion();
      BulkEditSearchPane.verifyLogsRecordTypesAccordionExistsAndUnchecked();
      BulkEditSearchPane.verifyRecordTypesSortedAlphabetically();
      const recordTypes = ['Inventory - holdings', 'Inventory - items', 'Users'];
      recordTypes.forEach((recordType) => BulkEditSearchPane.checkLogsCheckbox(recordType));
      BulkEditSearchPane.resetAllBtnIsDisabled(false);
      BulkEditSearchPane.verifyClearSelectedFiltersButton('Record types');
      BulkEditSearchPane.clickClearSelectedFiltersButton('Record types');
      BulkEditSearchPane.verifyLogsPane();
      BulkEditSearchPane.checkLogsCheckbox('Users');
      BulkEditSearchPane.resetAllBtnIsDisabled(false);
      BulkEditSearchPane.verifyClearSelectedFiltersButton('Record types');
      BulkEditSearchPane.verifyCellsValues(1, 'Users');
      BulkEditSearchPane.resetAll();
    },
  );

  it(
    'C368035 Filters section: Started, Ended (firebird) (TaaS)',
    { tags: ['extendedPath', 'firebird'] },
    () => {
      const currentDate = DateTools.getCurrentDateForFiscalYear();
      const yesterday = DateTools.getPreviousDayDateForFiscalYear();
      const tomorrow = DateTools.getDayTomorrowDateForFiscalYear();
      BulkEditSearchPane.openLogsSearch();
      BulkEditSearchPane.verifySetCriteriaPaneExists();
      BulkEditSearchPane.verifyLogsPane();
      const recordTypes = ['Inventory - holdings', 'Inventory - items', 'Users'];
      recordTypes.forEach((recordType) => BulkEditSearchPane.checkLogsCheckbox(recordType));
      BulkEditSearchPane.verifyUserAccordionCollapsed();
      BulkEditSearchPane.clickLogsStartedAccordion();
      BulkEditSearchPane.verifyLogsStartedAccordionExistsWithElements();
      BulkEditSearchPane.clickLogsEndedAccordion();
      BulkEditSearchPane.verifyLogsEndedAccordionExistsWithElements();
      BulkEditSearchPane.fillLogsDate('Started', 'From', currentDate);
      BulkEditSearchPane.verifyClearSelectedDateButtonExists('Started', 'From');
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Started', 'From', currentDate);
      BulkEditSearchPane.applyStartDateFilters();
      BulkEditSearchPane.verifyDateFieldWithError('Started', 'To', 'Please enter an end date');
      BulkEditSearchPane.fillLogsDate('Started', 'To', yesterday);
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Started', 'To', yesterday);
      BulkEditSearchPane.verifyClearSelectedDateButtonExists('Started', 'To');
      BulkEditSearchPane.applyStartDateFilters();
      BulkEditSearchPane.verifyDateAccordionValidationMessage(
        'Started',
        'Start date is greater than end date',
      );
      BulkEditSearchPane.clickClearSelectedDateButton('Started', 'From');
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Started', 'From', '');
      BulkEditSearchPane.verifyLogsStartedAccordionExistsWithElements();
      BulkEditSearchPane.fillLogsDate('Started', 'From', currentDate);
      BulkEditSearchPane.applyStartDateFilters();
      BulkEditSearchPane.verifyDateCellsValues(6, yesterday, currentDate);
      BulkEditSearchPane.verifyClearSelectedFiltersButton('Started');
      BulkEditSearchPane.fillLogsDate('Ended', 'To', yesterday);
      BulkEditSearchPane.verifyClearSelectedDateButtonExists('Ended', 'To');
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Ended', 'To', yesterday);
      BulkEditSearchPane.applyEndDateFilters();
      BulkEditSearchPane.verifyDateFieldWithError('Ended', 'From', 'Please enter a start date');
      BulkEditSearchPane.fillLogsDate('Ended', 'From', currentDate);
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Ended', 'From', currentDate);
      BulkEditSearchPane.verifyClearSelectedDateButtonExists('Ended', 'From');
      BulkEditSearchPane.applyEndDateFilters();
      BulkEditSearchPane.verifyDateAccordionValidationMessage(
        'Ended',
        'Start date is greater than end date',
      );
      BulkEditSearchPane.clickClearSelectedDateButton('Ended', 'To');
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Ended', 'To', '');
      BulkEditSearchPane.verifyLogsStartedAccordionExistsWithElements();
      BulkEditSearchPane.fillLogsDate('Ended', 'To', tomorrow);
      BulkEditSearchPane.applyEndDateFilters();
      BulkEditSearchPane.verifyDateCellsValues(7, yesterday, tomorrow);
      BulkEditSearchPane.verifyClearSelectedFiltersButton('Ended');
      BulkEditSearchPane.fillLogsDate('Ended', 'From', yesterday);
      BulkEditSearchPane.fillLogsDate('Ended', 'To', tomorrow);
      BulkEditSearchPane.applyEndDateFilters();
      BulkEditSearchPane.verifyDateCellsValues(6, yesterday, currentDate);
      BulkEditSearchPane.verifyDateCellsValues(7, yesterday, tomorrow);
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Started', 'From', '');
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Started', 'To', '');
      BulkEditSearchPane.verifyDateCellsValues(7, yesterday, tomorrow);
      BulkEditSearchPane.resetAll();
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Started', 'From', '');
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Started', 'To', '');
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Ended', 'From', '');
      BulkEditSearchPane.verifyLogsDateFiledIsEqual('Ended', 'To', '');
      BulkEditSearchPane.clickLogsStartedAccordion();
      BulkEditSearchPane.clickLogsEndedAccordion();
      BulkEditSearchPane.verifySetCriteriaPaneExists();
      BulkEditSearchPane.verifyLogsPane();
    },
  );

  it(
    'C368037 Verify that after clicking on "Reset all" button, all filters resets (firebird) (TaaS)',
    { tags: ['extendedPath', 'firebird'] },
    () => {
      BulkEditSearchPane.openLogsSearch();
      BulkEditSearchPane.verifySetCriteriaPaneExists();
      BulkEditSearchPane.resetAllBtnIsDisabled(true);
      BulkEditSearchPane.verifyLogsStatusesAccordionExistsAndUnchecked();
      BulkEditSearchPane.verifyLogsRecordTypesAccordionExistsAndUnchecked();
      BulkEditSearchPane.verifyLogsStartedAccordionCollapsed();
      BulkEditSearchPane.verifyLogsEndedAccordionCollapsed();
      BulkEditSearchPane.verifyUserAccordionCollapsed();
      BulkEditSearchPane.checkLogsCheckbox('Completed');
      BulkEditSearchPane.resetAllBtnIsDisabled(false);
      BulkEditSearchPane.verifyClearSelectedFiltersButton('Statuses');
      BulkEditSearchPane.verifyCellsValues(2, 'Completed');
      BulkEditSearchPane.resetAll();
      BulkEditSearchPane.resetAllBtnIsDisabled(true);
      BulkEditSearchPane.verifyLogsStatusesAccordionExistsAndUnchecked();
      BulkEditSearchPane.verifyClearSelectedFiltersButton('Statuses', 'absent');
      BulkEditSearchPane.verifyLogsTableHeaders('absent');
    },
  );
});
