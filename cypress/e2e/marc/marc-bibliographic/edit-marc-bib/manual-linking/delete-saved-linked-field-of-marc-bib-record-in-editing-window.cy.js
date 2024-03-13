import Permissions from '../../../../../support/dictionary/permissions';
import DataImport from '../../../../../support/fragments/data_import/dataImport';
import InventoryInstance from '../../../../../support/fragments/inventory/inventoryInstance';
import InventoryInstances from '../../../../../support/fragments/inventory/inventoryInstances';
import MarcAuthorities from '../../../../../support/fragments/marcAuthority/marcAuthorities';
import MarcAuthority from '../../../../../support/fragments/marcAuthority/marcAuthority';
import QuickMarcEditor from '../../../../../support/fragments/quickMarcEditor';
import TopMenu from '../../../../../support/fragments/topMenu';
import Users from '../../../../../support/fragments/users/users';
import getRandomPostfix from '../../../../../support/utils/stringTools';

describe('MARC', () => {
  describe('MARC Bibliographic', () => {
    describe('Edit MARC bib', () => {
      describe('Manual linking', () => {
        const testData = {
          createdRecordIDs: [],
          contributor: 'Coates, Ta-Nehisi',
          bib100AfterLinkingToAuth100: [
            33,
            '100',
            '1',
            '\\',
            '$a C366573 Coates, Ta-Nehisi',
            '$e author.',
            '$0 http://id.loc.gov/authorities/names/n2008001084',
            '',
          ],
        };

        const marcFiles = [
          {
            marc: 'marcBibFileForC366573.mrc',
            fileName: `C366573 testMarcFile${getRandomPostfix()}.mrc`,
            jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
            numOfRecords: 1,
            propertyName: 'relatedInstanceInfo',
          },
          {
            marc: 'marcAuthFileC366573.mrc',
            fileName: `C366573 testMarcFile${getRandomPostfix()}.mrc`,
            jobProfileToRun: 'Default - Create SRS MARC Authority',
            numOfRecords: 1,
            propertyName: 'relatedAuthorityInfo',
          },
        ];
        const linkingTagAndValue = {
          tag: '100',
          rowIndex: 33,
          value: 'C366573 Coates, Ta-Nehisi,',
        };

        before('Creating test data', () => {
          cy.loginAsAdmin();
          // make sure there are no duplicate authority records in the system
          cy.getAdminToken().then(() => {
            MarcAuthorities.getMarcAuthoritiesViaApi({
              limit: 100,
              query: 'keyword="C366573"',
            }).then((records) => {
              records.forEach((record) => {
                if (record.authRefType === 'Authorized') {
                  MarcAuthority.deleteViaAPI(record.id);
                }
              });
            });
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(
                marcFile.marc,
                marcFile.fileName,
                marcFile.jobProfileToRun,
              ).then((response) => {
                response.entries.forEach((record) => {
                  testData.createdRecordIDs.push(record[marcFile.propertyName].idList[0]);
                });
              });
            });
          });

          cy.createTempUser([
            Permissions.moduleDataImportEnabled.gui,
            Permissions.inventoryAll.gui,
            Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
            Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
          ]).then((userProperties) => {
            testData.user = userProperties;

            cy.loginAsAdmin();
            cy.visit(TopMenu.inventoryPath);
            InventoryInstances.searchByTitle(testData.createdRecordIDs[0]);
            InventoryInstances.selectInstance();
            InventoryInstance.editMarcBibliographicRecord();
            InventoryInstance.verifyAndClickLinkIconByIndex(linkingTagAndValue.rowIndex);
            MarcAuthorities.switchToSearch();
            InventoryInstance.verifySelectMarcAuthorityModal();
            InventoryInstance.searchResults(linkingTagAndValue.value);
            InventoryInstance.clickLinkButton();
            QuickMarcEditor.verifyAfterLinkingUsingRowIndex(
              linkingTagAndValue.tag,
              linkingTagAndValue.rowIndex,
            );
            QuickMarcEditor.pressSaveAndClose();
            QuickMarcEditor.checkAfterSaveAndClose();

            cy.login(testData.user.username, testData.user.password, {
              path: TopMenu.inventoryPath,
              waiter: InventoryInstances.waitContentLoading,
            });
          });
        });

        after('Deleting test data', () => {
          cy.getAdminToken().then(() => {
            Users.deleteViaApi(testData.user.userId);
            InventoryInstance.deleteInstanceViaApi(testData.createdRecordIDs[0]);
            MarcAuthority.deleteViaAPI(testData.createdRecordIDs[1]);
          });
        });

        it(
          'C366573 Delete saved linked field of "MARC Bib" record in editing window (spitfire) (TaaS)',
          { tags: ['extendedPath', 'spitfire'] },
          () => {
            InventoryInstances.searchByTitle(testData.createdRecordIDs[0]);
            InventoryInstances.selectInstance();
            InventoryInstance.editMarcBibliographicRecord();
            QuickMarcEditor.verifyTagFieldAfterLinking(...testData.bib100AfterLinkingToAuth100);
            QuickMarcEditor.deleteFieldAndCheck(
              linkingTagAndValue.rowIndex,
              linkingTagAndValue.tag,
            );
            QuickMarcEditor.checkButtonsEnabled();
            QuickMarcEditor.clickSaveAndCloseThenCheck(1);
            QuickMarcEditor.constinueWithSaveAndCheckInstanceRecord();
            InventoryInstance.verifyContributorAbsent(testData.contributor);
          },
        );
      });
    });
  });
});
