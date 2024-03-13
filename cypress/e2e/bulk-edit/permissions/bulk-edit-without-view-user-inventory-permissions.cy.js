import permissions from '../../../support/dictionary/permissions';
import BulkEditSearchPane, {
  userIdentifiers,
  itemIdentifiers,
  holdingsIdentifiers,
} from '../../../support/fragments/bulk-edit/bulk-edit-search-pane';
import TopMenu from '../../../support/fragments/topMenu';
import Users from '../../../support/fragments/users/users';

let firstUser;
let secondUser;

describe('bulk-edit', () => {
  describe('permissions', () => {
    before('create test data', () => {
      cy.createTempUser([
        permissions.bulkEditLogsView.gui,
        permissions.bulkEditCsvView.gui,
        permissions.bulkEditCsvEdit.gui,
        permissions.bulkEditEdit.gui,
        permissions.bulkEditView.gui,
        permissions.bulkEditUpdateRecords.gui,
      ]).then((userProperties) => {
        firstUser = userProperties;
        cy.login(firstUser.username, firstUser.password, {
          path: TopMenu.bulkEditPath,
          waiter: BulkEditSearchPane.waitLoading,
        });
      });

      cy.createTempUser([
        permissions.bulkEditLogsView.gui,
        permissions.bulkEditCsvView.gui,
        permissions.bulkEditCsvEdit.gui,
        permissions.bulkEditEdit.gui,
        permissions.bulkEditView.gui,
        permissions.uiInventoryViewInstances.gui,
        permissions.uiInventoryViewCreateEditHoldings.gui,
        permissions.uiInventoryViewCreateEditItems.gui,
        permissions.uiUsersPermissions.gui,
        permissions.uiUsersPermissionsView.gui,
        permissions.uiUsersView.gui,
        permissions.uiUserEdit.gui,
      ]).then((userProperties) => {
        secondUser = userProperties;
      });
    });

    after('delete test data', () => {
      cy.getAdminToken();
      Users.deleteViaApi(firstUser.userId);
      Users.deleteViaApi(secondUser.userId);
    });

    it(
      'C404389 Verify Bulk edit app without permissions for view Users and Inventory records (firebird) (TaaS)',
      { tags: ['extendedPath', 'firebird'] },
      () => {
        BulkEditSearchPane.verifyBulkEditPaneItems();
        BulkEditSearchPane.verifySetCriteriaPaneSpecificTabs('Identifier', 'Logs');
        BulkEditSearchPane.verifySpecificTabHighlighted('Identifier');
        BulkEditSearchPane.verifyPanesBeforeImport();
        BulkEditSearchPane.openLogsSearch();
        BulkEditSearchPane.verifyLogsPane();
        BulkEditSearchPane.checkHoldingsCheckbox();
        BulkEditSearchPane.checkUsersCheckbox();
        BulkEditSearchPane.checkItemsCheckbox();
        BulkEditSearchPane.logActionsIsAbsent();

        cy.login(secondUser.username, secondUser.password, {
          path: TopMenu.bulkEditPath,
          waiter: BulkEditSearchPane.waitLoading,
        });
        BulkEditSearchPane.verifySetCriteriaPaneSpecificTabs('Identifier', 'Logs');
        BulkEditSearchPane.verifySpecificTabHighlighted('Identifier');
        BulkEditSearchPane.verifySetCriteriaPaneSpecificTabsHidden('Query');

        BulkEditSearchPane.verifyPanesBeforeImport();
        BulkEditSearchPane.verifyBulkEditPaneItems();
        BulkEditSearchPane.verifySetCriteriaPaneItems(false);
        BulkEditSearchPane.verifyRecordTypesAccordion();
        BulkEditSearchPane.verifyRecordTypeIdentifiers('Users');
        userIdentifiers.forEach((identifier) => {
          BulkEditSearchPane.verifyDragNDropRecordTypeIdentifierArea('Users', identifier);
        });

        BulkEditSearchPane.verifyRecordTypeIdentifiers('Items');
        BulkEditSearchPane.clickRecordTypesAccordion();
        BulkEditSearchPane.verifyRecordTypesAccordionCollapsed();
        BulkEditSearchPane.clickRecordTypesAccordion();
        itemIdentifiers.forEach((identifier) => {
          BulkEditSearchPane.verifyDragNDropRecordTypeIdentifierArea('Items', identifier);
        });

        BulkEditSearchPane.verifyRecordTypeIdentifiers('Holdings');
        holdingsIdentifiers.forEach((identifier) => {
          BulkEditSearchPane.verifyDragNDropRecordTypeIdentifierArea('Holdings', identifier);
        });

        BulkEditSearchPane.openLogsSearch();
        BulkEditSearchPane.verifyLogsPane();
      },
    );
  });
});
