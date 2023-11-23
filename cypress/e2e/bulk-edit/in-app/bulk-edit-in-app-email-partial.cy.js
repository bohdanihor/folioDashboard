import TopMenu from '../../../support/fragments/topMenu';
import testTypes from '../../../support/dictionary/testTypes';
import permissions from '../../../support/dictionary/permissions';
import BulkEditSearchPane from '../../../support/fragments/bulk-edit/bulk-edit-search-pane';
import FileManager from '../../../support/utils/fileManager';
import getRandomPostfix from '../../../support/utils/stringTools';
import devTeams from '../../../support/dictionary/devTeams';
import BulkEditActions from '../../../support/fragments/bulk-edit/bulk-edit-actions';
import Users from '../../../support/fragments/users/users';
import UsersSearchPane from '../../../support/fragments/users/usersSearchPane';
import UsersCard from '../../../support/fragments/users/usersCard';

let user;
const userBarcodesFileName = `userBarcodes_${getRandomPostfix()}.csv`;

describe('bulk-edit', () => {
  describe('in-app approach', () => {
    before('create test data', () => {
      cy.createTempUser([
        permissions.bulkEditUpdateRecords.gui,
        permissions.uiUsersView.gui,
        permissions.uiUsersCreate.gui
      ], 'staff').then(
        (userProperties) => {
          user = userProperties;
          cy.login(user.username, user.password, {
            path: TopMenu.bulkEditPath,
            waiter: BulkEditSearchPane.waitLoading,
          });
          FileManager.createFile(`cypress/fixtures/${userBarcodesFileName}`, user.barcode);
        },
      );
    });

    after('delete test data', () => {
      cy.getAdminToken();
      FileManager.deleteFile(`cypress/fixtures/${userBarcodesFileName}`);
      Users.deleteViaApi(user.userId);
    });

    it(
      'C365590 Verify that User\'s Email can be edited partially (firebird) (TaaS)',
      { tags: [testTypes.extendedPath, devTeams.firebird] },
      () => {
        BulkEditSearchPane.verifyDragNDropUsersBarcodesArea();
        BulkEditSearchPane.uploadFile(userBarcodesFileName);
        BulkEditSearchPane.waitFileUploading();

        BulkEditActions.openActions();
        BulkEditSearchPane.changeShowColumnCheckboxIfNotYet('Email');
        BulkEditActions.openInAppStartBulkEditFrom();
        const oldEmailDomain = 'folio.org';
        const newEmailDomain = 'google.com';
        BulkEditActions.replaceEmail(oldEmailDomain, newEmailDomain);
        BulkEditActions.confirmChanges();
        BulkEditActions.clickX();
        BulkEditActions.enterOldEmail('example.com');
        BulkEditActions.enterNewEmail('example2.com2');
        BulkEditActions.confirmChanges();
        BulkEditActions.clickX();
        BulkEditActions.enterOldEmail(oldEmailDomain);
        BulkEditActions.enterNewEmail(newEmailDomain);
        BulkEditActions.confirmChanges();
        BulkEditActions.commitChanges();
        BulkEditSearchPane.verifyChangedResults(`test@${newEmailDomain}`);
        cy.visit(TopMenu.usersPath);
        UsersSearchPane.searchByKeywords(user.username);
        UsersSearchPane.openUser(user.username);
        UsersCard.openContactInfo();
        UsersCard.verifyEmail(`test@${newEmailDomain}`);
      }
    );
  });
});