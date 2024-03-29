import { Permissions } from '../../../support/dictionary';
import ExportFieldMappingProfiles from '../../../support/fragments/data-export/exportMappingProfile/exportFieldMappingProfiles';
import SettingsPane from '../../../support/fragments/settings/settingsPane';
import SettingsMenu from '../../../support/fragments/settingsMenu';
import TopMenu from '../../../support/fragments/topMenu';
import Users from '../../../support/fragments/users/users';

describe('settings: data-export', () => {
  let user;
  const searchText = 'mapping profile';
  const searchWithoutResults = '00000000';

  before('Create test data', () => {
    cy.createTempUser([
      Permissions.dataExportEnableSettings.gui,
      Permissions.dataExportEnableApp.gui,
    ]).then((userProperties) => {
      user = userProperties;
      cy.login(user.username, user.password, {
        path: TopMenu.settingsPath,
        waiter: SettingsPane.waitLoading,
      });
    });
  });

  after('Delete test data', () => {
    cy.getAdminToken();
    Users.deleteViaApi(user.userId);
  });

  it(
    'C345410 Search mapping profiles (firebird) (TaaS)',
    { tags: ['extendedPath', 'firebird'] },
    () => {
      cy.visit(SettingsMenu.exportMappingProfilePath);
      ExportFieldMappingProfiles.verifyFieldMappingProfilesPane();
      ExportFieldMappingProfiles.searchFieldMappingProfile(searchText);
      ExportFieldMappingProfiles.verifySearchButtonEnabled(true);
      ExportFieldMappingProfiles.verifyClearSearchButtonExists();
      ExportFieldMappingProfiles.verifyFieldMappingProfilesSearchResult(searchText);
      ExportFieldMappingProfiles.clearSearchField();
      ExportFieldMappingProfiles.searchFieldMappingProfile(searchWithoutResults);
      ExportFieldMappingProfiles.verifyFieldMappingProfilesSearchResult(searchWithoutResults);
      ExportFieldMappingProfiles.clearSearchField();
      ExportFieldMappingProfiles.verifyClearSearchButtonAbsent();
      ExportFieldMappingProfiles.verifySearchButtonEnabled(false);
      ExportFieldMappingProfiles.verifyFieldMappingProfilesPane();
    },
  );
});
