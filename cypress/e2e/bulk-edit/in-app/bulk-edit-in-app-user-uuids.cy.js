import permissions from '../../../support/dictionary/permissions';
import BulkEditActions from '../../../support/fragments/bulk-edit/bulk-edit-actions';
import BulkEditSearchPane from '../../../support/fragments/bulk-edit/bulk-edit-search-pane';
import TopMenu from '../../../support/fragments/topMenu';
import Users from '../../../support/fragments/users/users';
import UsersCard from '../../../support/fragments/users/usersCard';
import UsersSearchPane from '../../../support/fragments/users/usersSearchPane';
import FileManager from '../../../support/utils/fileManager';
import getRandomPostfix from '../../../support/utils/stringTools';
import ExportFile from '../../../support/fragments/data-export/exportFile';

let user;
const invalidUserUUID = getRandomPostfix();
const userUUIDsFileName = `userUUIDs_${getRandomPostfix()}.csv`;
const matchedRecordsFileName = `Matched-Records-${userUUIDsFileName}`;
const invalidUserUUIDsFileName = `invalidUserUUIDs_${getRandomPostfix()}.csv`;
const errorsFromMatchingFileName = `*-Matching-Records-Errors-${invalidUserUUIDsFileName}`;

describe('bulk-edit', () => {
  describe('in-app approach', () => {
    before('create test data', () => {
      cy.createTempUser(
        [permissions.bulkEditUpdateRecords.gui, permissions.uiUserEdit.gui],
        'undergrad',
      ).then((userProperties) => {
        user = userProperties;
        cy.login(user.username, user.password);
        FileManager.createFile(`cypress/fixtures/${userUUIDsFileName}`, user.userId);
        FileManager.createFile(`cypress/fixtures/${invalidUserUUIDsFileName}`, invalidUserUUID);
      });
    });

    beforeEach('select User', () => {
      cy.visit(TopMenu.bulkEditPath);
      BulkEditSearchPane.verifyDragNDropRecordTypeIdentifierArea('Users', 'User UUIDs');
    });

    after('delete test data', () => {
      cy.getAdminToken();
      FileManager.deleteFile(`cypress/fixtures/${userUUIDsFileName}`);
      FileManager.deleteFile(`cypress/fixtures/${invalidUserUUIDsFileName}`);
      FileManager.deleteFileFromDownloadsByMask(
        `*${matchedRecordsFileName}`,
        errorsFromMatchingFileName,
      );
      Users.deleteViaApi(user.userId);
    });

    it(
      'C357579 Bulk edit: In app - Update user records permission enabled - Preview of records matched (firebird)',
      { tags: ['smoke', 'firebird'] },
      () => {
        BulkEditSearchPane.uploadFile(userUUIDsFileName);
        BulkEditSearchPane.waitFileUploading();

        BulkEditActions.downloadMatchedResults();
        BulkEditSearchPane.verifyUserBarcodesResultAccordion();

        BulkEditActions.openInAppStartBulkEditFrom();
        BulkEditActions.verifyBulkEditForm();
      },
    );

    it(
      'C357987 Verify Users Patron group bulk edit -- in app approach (firebird)',
      { tags: ['smoke', 'firebird'] },
      () => {
        BulkEditSearchPane.uploadFile(userUUIDsFileName);
        BulkEditSearchPane.waitFileUploading();

        BulkEditActions.openActions();
        BulkEditActions.openInAppStartBulkEditFrom();
        BulkEditActions.fillPatronGroup('graduate (Graduate Student)');
        BulkEditActions.confirmChanges();
        BulkEditActions.commitChanges();
        BulkEditSearchPane.waitFileUploading();

        cy.loginAsAdmin({ path: TopMenu.usersPath, waiter: UsersSearchPane.waitLoading });
        UsersSearchPane.searchByKeywords(user.username);
        UsersSearchPane.openUser(user.username);
        UsersCard.verifyPatronBlockValue('graduate');
      },
    );

    it(
      'C359213 Verify elements "Are you sure form?" -- Users-in app approach (firebird)',
      { tags: ['smoke', 'firebird'] },
      () => {
        BulkEditSearchPane.uploadFile(userUUIDsFileName);
        BulkEditSearchPane.waitFileUploading();

        BulkEditActions.openActions();
        BulkEditActions.openInAppStartBulkEditFrom();
        BulkEditActions.fillPatronGroup('staff (Staff Member)');

        BulkEditActions.confirmChanges();
        BulkEditActions.verifyAreYouSureForm(1, user.username);
        BulkEditActions.clickKeepEditingBtn();

        BulkEditActions.confirmChanges();
        BulkEditActions.commitChanges();
        BulkEditSearchPane.waitFileUploading();
        BulkEditActions.verifySuccessBanner(1);
        BulkEditSearchPane.verifyChangedResults('staff');
      },
    );

    it(
      'C359214 Verify expiration date updates in In-app approach (firebird)',
      { tags: ['smoke', 'firebird'] },
      () => {
        const todayDate = new Date();
        BulkEditSearchPane.uploadFile(userUUIDsFileName);
        BulkEditSearchPane.waitFileUploading();

        BulkEditActions.openActions();
        BulkEditActions.openInAppStartBulkEditFrom();
        BulkEditActions.fillExpirationDate(todayDate);
        BulkEditActions.confirmChanges();
        BulkEditActions.commitChanges();
        BulkEditSearchPane.waitFileUploading();
        BulkEditActions.verifySuccessBanner(1);

        cy.loginAsAdmin({ path: TopMenu.usersPath, waiter: UsersSearchPane.waitLoading });
        UsersSearchPane.searchByKeywords(user.username);
        UsersSearchPane.openUser(user.username);
        UsersCard.verifyExpirationDate(todayDate);
      },
    );

    it(
      'C359237 Verify "Expiration date" option in the dropdown (firebird)',
      { tags: ['smoke', 'firebird'] },
      () => {
        BulkEditSearchPane.uploadFile(userUUIDsFileName);
        BulkEditSearchPane.waitFileUploading();

        BulkEditActions.openActions();
        BulkEditActions.openInAppStartBulkEditFrom();
        BulkEditActions.verifyCalendarItem();
      },
    );

    it(
      'C359585 Verify clicking on the "Commit changes" button (firebird)',
      { tags: ['smoke', 'firebird'] },
      () => {
        BulkEditSearchPane.uploadFile(userUUIDsFileName);
        BulkEditSearchPane.waitFileUploading();

        BulkEditActions.openActions();
        BulkEditActions.verifyCheckedDropdownMenuItem();
        BulkEditActions.verifyUncheckedDropdownMenuItem();

        BulkEditActions.openInAppStartBulkEditFrom();
        BulkEditActions.fillPatronGroup('faculty (Faculty Member)');
        BulkEditActions.confirmChanges();
        BulkEditActions.verifyAreYouSureForm(1, user.username);
        BulkEditActions.commitChanges();
        BulkEditSearchPane.waitFileUploading();
        BulkEditActions.verifySuccessBanner(1);
        BulkEditSearchPane.verifyChangedResults(user.username);
      },
    );

    it(
      'C359211 Verify upload file with invalid identifiers -- " -- Users-in app approach (firebird) (TaaS)',
      { tags: ['extendedPath', 'firebird'] },
      () => {
        BulkEditSearchPane.uploadFile(invalidUserUUIDsFileName);
        BulkEditSearchPane.waitFileUploading();
        BulkEditSearchPane.verifyNonMatchedResults(invalidUserUUID);
        BulkEditSearchPane.verifyErrorLabel(invalidUserUUIDsFileName, 0, 1);
        BulkEditActions.openActions();
        BulkEditActions.downloadErrors();
        ExportFile.verifyFileIncludes(errorsFromMatchingFileName, [
          invalidUserUUID,
          'No match found',
        ]);
      },
    );
  });
});
