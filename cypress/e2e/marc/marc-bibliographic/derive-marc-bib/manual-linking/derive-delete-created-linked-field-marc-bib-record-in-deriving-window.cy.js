import Permissions from '../../../../../support/dictionary/permissions';
import TopMenu from '../../../../../support/fragments/topMenu';
import Users from '../../../../../support/fragments/users/users';
import InventoryInstance from '../../../../../support/fragments/inventory/inventoryInstance';
import QuickMarcEditor from '../../../../../support/fragments/quickMarcEditor';
import InventoryInstances from '../../../../../support/fragments/inventory/inventoryInstances';
import MarcAuthorities from '../../../../../support/fragments/marcAuthority/marcAuthorities';
import DataImport from '../../../../../support/fragments/data_import/dataImport';
import getRandomPostfix from '../../../../../support/utils/stringTools';
import MarcAuthority from '../../../../../support/fragments/marcAuthority/marcAuthority';

describe('MARC', () => {
  describe('MARC Bibliographic', () => {
    describe('Derive MARC bib', () => {
      describe('Manual linking', () => {
        const testData = {
          tag700: '700',
          rowIndex: 22,
          createdRecordsIDs: [],
        };

        const marcFiles = [
          {
            marc: 'marcBibFileForC380760.mrc',
            fileName: `testMarcFileC380760${getRandomPostfix()}.mrc`,
            jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
            numOfRecords: 1,
            propertyName: 'relatedInstanceInfo',
          },
          {
            marc: 'marcAuthFileC380760.mrc',
            fileName: `testMarcFileC380760${getRandomPostfix()}.mrc`,
            jobProfileToRun: 'Default - Create SRS MARC Authority',
            authorityHeading: 'C380760 Coates, Ta-Nehisi',
            numOfRecords: 1,
            propertyName: 'relatedAuthorityInfo',
          },
        ];
        const bib700AfterLinkingToAuth100 = [
          testData.rowIndex,
          testData.tag700,
          '\\',
          '\\',
          '$a C380760 Coates, Ta-Nehisi',
          '',
          '$0 http://id.loc.gov/authorities/names/n2008001084',
          '',
        ];

        const field245Value =
          '$a Crossfire DERIVED : $b a litany for survival : poems 1998-2019 / $c Staceyann Chin ; foreword by Jacqueline Woodson.';

        before('Creating user and test data', () => {
          cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading });
          cy.getAdminToken().then(() => {
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(
                marcFile.marc,
                marcFile.fileName,
                marcFile.jobProfileToRun,
              ).then((response) => {
                response.entries.forEach((record) => {
                  testData.createdRecordsIDs.push(record[marcFile.propertyName].idList[0]);
                });
              });
            });
          });

          cy.createTempUser([
            Permissions.moduleDataImportEnabled.gui,
            Permissions.inventoryAll.gui,
            Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
            Permissions.uiQuickMarcQuickMarcEditorDuplicate.gui,
            Permissions.uiQuickMarcQuickMarcAuthorityLinkUnlink.gui,
          ]).then((createdUserProperties) => {
            testData.userData = createdUserProperties;

            cy.login(testData.userData.username, testData.userData.password, {
              path: TopMenu.inventoryPath,
              waiter: InventoryInstances.waitContentLoading,
            });
            InventoryInstances.searchByTitle(testData.createdRecordsIDs[0]);
            InventoryInstances.selectInstance();
          });
        });

        after('delete test data', () => {
          cy.getAdminToken();
          Users.deleteViaApi(testData.userData.userId);
          InventoryInstance.deleteInstanceViaApi(testData.createdRecordsIDs[0]);
          MarcAuthority.deleteViaAPI(testData.createdRecordsIDs[1]);
        });

        it(
          'C380760 Derive | Delete created linked field of "MARC Bib" record in deriving window (spitfire) (TaaS)',
          { tags: ['extendedPath', 'spitfire'] },
          () => {
            InventoryInstance.deriveNewMarcBib();
            QuickMarcEditor.addNewField(testData.tag700, '', 21);
            QuickMarcEditor.clickLinkIconInTagField(testData.rowIndex);
            MarcAuthorities.switchToSearch();
            InventoryInstance.verifySelectMarcAuthorityModal();
            InventoryInstance.searchResults(marcFiles[1].authorityHeading);
            InventoryInstance.clickLinkButton();
            QuickMarcEditor.verifyAfterLinkingUsingRowIndex(testData.tag700, testData.rowIndex);
            QuickMarcEditor.checkUnlinkTooltipText(
              testData.rowIndex,
              'Unlink from MARC Authority record',
            );
            QuickMarcEditor.checkViewMarcAuthorityTooltipText(testData.rowIndex);
            QuickMarcEditor.verifyTagFieldAfterLinking(...bib700AfterLinkingToAuth100);
            QuickMarcEditor.deleteField(testData.rowIndex);
            QuickMarcEditor.updateExistingFieldContent(12, field245Value);
            QuickMarcEditor.pressSaveAndClose();
            QuickMarcEditor.checkAfterSaveAndCloseDerive();
            InventoryInstance.checkInstanceTitle('Crossfire DERIVED');
            InventoryInstance.verifyContributorAbsent('C380760 Coates, Ta-Nehisi');
          },
        );
      });
    });
  });
});
