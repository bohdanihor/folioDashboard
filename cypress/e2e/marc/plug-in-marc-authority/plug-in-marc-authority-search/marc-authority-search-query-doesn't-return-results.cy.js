import { Permissions } from '../../../../support/dictionary';
import InventoryInstance from '../../../../support/fragments/inventory/inventoryInstance';
import InventoryInstances from '../../../../support/fragments/inventory/inventoryInstances';
import MarcAuthorities from '../../../../support/fragments/marcAuthority/marcAuthorities';
import QuickMarcEditor from '../../../../support/fragments/quickMarcEditor';
import TopMenu from '../../../../support/fragments/topMenu';
import Users from '../../../../support/fragments/users/users';
import getRandomPostfix from '../../../../support/utils/stringTools';

describe('MARC', () => {
  describe('plug-in MARC authority', () => {
    describe('plug-in MARC authority | Search', () => {
      const user = {};
      const searchValue = `name${getRandomPostfix()}`;
      before(() => {
        cy.createTempUser([
          Permissions.inventoryAll.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
          Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthorityLinkUnlink.gui,
        ]).then((createdUserProperties) => {
          user.userProperties = createdUserProperties;

          cy.login(user.userProperties.username, user.userProperties.password, {
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          });
          InventoryInstances.searchByTitle('Crossfire');
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          QuickMarcEditor.clickLinkIconInTagField(9);
          MarcAuthorities.switchToSearch();
        });
      });

      afterEach(() => {
        cy.getAdminToken().then(() => {
          Users.deleteViaApi(user.userProperties.userId);
        });
      });

      it(
        "C359180 MARC Authority plug-in | Use search query that doesn't return results (spitfire) (TaaS)",
        { tags: ['extendedPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchByParameter('Keyword', searchValue);
          MarcAuthorities.checkNoResultsMessage(
            `No results found for "${searchValue}". Please check your spelling and filters.`,
          );
          MarcAuthorities.verifySearchResultTabletIsAbsent();
          MarcAuthorities.verifyTextOfPaneHeaderMarcAuthority('0 results found');
        },
      );
    });
  });
});
