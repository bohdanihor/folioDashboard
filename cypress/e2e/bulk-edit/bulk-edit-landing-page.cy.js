import TopMenu from '../../support/fragments/topMenu';
import permissions from '../../support/dictionary/permissions';
import BulkEditSearchPane from '../../support/fragments/bulk-edit/bulk-edit-search-pane';
import Users from '../../support/fragments/users/users';

let user;

describe('bulk-edit', () => {
  before('create user', () => {
    cy.createTempUser([
      permissions.bulkEditLogsView.gui,
      permissions.bulkEditCsvEdit.gui,
      permissions.bulkEditCsvView.gui,
      permissions.bulkEditEdit.gui,
      permissions.bulkEditUpdateRecords.gui,
      permissions.bulkEditView.gui,
      permissions.bulkEditQueryView.gui,
      permissions.uiInventoryViewInstances.gui,
      permissions.uiInventoryViewCreateEditHoldings.gui,
      permissions.uiInventoryViewCreateEditItems.gui,
      permissions.uiUsersPermissions.gui,
      permissions.uiUserEdit.gui,
      permissions.uiUsersPermissionsView.gui,
      permissions.uiUsersView.gui,
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
    'C350929 Verify Bulk Edit app - landing page (firebird)',
    { tags: ['smoke', 'firebird'] },
    () => {
      BulkEditSearchPane.verifySetCriteriaPaneSpecificTabs('Identifier', 'Logs', 'Query');
      BulkEditSearchPane.verifySpecificTabHighlighted('Identifier');

      // verify panes
      BulkEditSearchPane.verifyRecordTypesSortedAlphabetically(false);
      BulkEditSearchPane.verifyPanesBeforeImport();
      BulkEditSearchPane.verifyBulkEditPaneItems();
      BulkEditSearchPane.verifySetCriteriaPaneItems();
      BulkEditSearchPane.verifyRecordTypesAccordion();

      // verify identifier items
      BulkEditSearchPane.verifyRecordIdentifierItems();
      BulkEditSearchPane.verifyDragNDropUsersUUIDsArea();
      BulkEditSearchPane.verifyDragNDropUsersBarcodesArea();
      BulkEditSearchPane.verifyDragNDropExternalIDsArea();
      BulkEditSearchPane.verifyDragNDropUsernamesArea();

      BulkEditSearchPane.verifyItemIdentifiersDefaultState();
      BulkEditSearchPane.clickRecordTypesAccordion();
      BulkEditSearchPane.verifyRecordTypesAccordionCollapsed();
      BulkEditSearchPane.clickRecordTypesAccordion();
      BulkEditSearchPane.verifyDragNDropItemBarcodeArea();
      BulkEditSearchPane.verifyDragNDropItemUUIDsArea();
      BulkEditSearchPane.verifyDragNDropItemHRIDsArea();
      BulkEditSearchPane.verifyDragNDropItemFormerIdentifierArea();
      BulkEditSearchPane.verifyDragNDropItemAccessionNumberArea();
      BulkEditSearchPane.verifyDragNDropItemHoldingsUUIDsArea();

      BulkEditSearchPane.verifyInstanceIdentifiers();
      [
        'Instance UUIDs',
        'Instance HRIDs',
        'ISBN',
        'ISSN'
      ].forEach((identifier) => BulkEditSearchPane.verifyDragNDropInstanceIdentifierArea(identifier));

      BulkEditSearchPane.verifyHoldingIdentifiers();
      BulkEditSearchPane.verifyDragNDropHoldingsUUIDsArea();
      BulkEditSearchPane.verifyDragNDropHoldingsHRIDsArea();
      BulkEditSearchPane.verifyDragNDropInstanceHRIDsArea();
      BulkEditSearchPane.verifyDragNDropHoldingsItemBarcodesArea();

      // verify logs items
      BulkEditSearchPane.openLogsSearch();
      BulkEditSearchPane.verifySetCriteriaPaneSpecificTabs('Identifier', 'Logs', 'Query');
      BulkEditSearchPane.verifySpecificTabHighlighted('Logs');
      BulkEditSearchPane.verifyLogsPane();
      BulkEditSearchPane.verifyRecordTypesSortedAlphabetically();
    },
  );
});
