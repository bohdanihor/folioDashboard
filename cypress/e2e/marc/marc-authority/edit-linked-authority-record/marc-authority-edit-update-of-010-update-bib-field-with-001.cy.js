import { Permissions } from '../../../../support/dictionary';
import DataImport from '../../../../support/fragments/data_import/dataImport';
import TopMenu from '../../../../support/fragments/topMenu';
import Users from '../../../../support/fragments/users/users';
import MarcAuthorities from '../../../../support/fragments/marcAuthority/marcAuthorities';
import MarcAuthority from '../../../../support/fragments/marcAuthority/marcAuthority';
import InventoryInstance from '../../../../support/fragments/inventory/inventoryInstance';
import InventoryInstances from '../../../../support/fragments/inventory/inventoryInstances';
import QuickMarcEditor from '../../../../support/fragments/quickMarcEditor';
import getRandomPostfix from '../../../../support/utils/stringTools';

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit linked Authority record', () => {
      const testData = {
        tag100: '100',
        tag010: '010',
        tag010NewValue: '$a  00000912  $z n 2005070769',
        authority100FieldValue: 'Erbil, H. Yıldırım',
        searchOption: 'Keyword',
        linked100Field: [
          16,
          '100',
          '1',
          '\\',
          '$a Erbil, H. Yıldırım',
          '',
          '$0 http://id.loc.gov/authorities/names/n00000912',
          '',
        ],
        updated100Field: [
          16,
          '100',
          '1',
          '\\',
          '$a Erbil, H. Yıldırım',
          '',
          '$0 http://id.loc.gov/authorities/names/n00000911',
          '',
        ],
        saveCalloutMessage:
          'This record has successfully saved and is in process. 1 linked bibliographic record(s) updates have begun.',
        areYouSureModalMessage:
          '1 bibliographic record is linked to this authority record and will be updated by clicking the Save button.',
      };

      const marcFiles = [
        {
          marc: 'marcBibFileForC376595.mrc',
          fileName: `testMarcFileC376595.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
          propertyName: 'relatedInstanceInfo',
          instanceTitle: 'Surface chemistry of solid and liquid interfaces / H. Yıldırım Erbil.',
        },
        {
          marc: 'marcAuthFileForC376595.mrc',
          fileName: `testMarcFileC376595.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          propertyName: 'relatedAuthorityInfo',
          authorityHeading: 'Erbil, H. Yıldırım',
        },
      ];

      const createdRecordIDs = [];

      before('Create test data', () => {
        cy.getAdminToken();
        marcFiles.forEach((marcFile) => {
          DataImport.uploadFileViaApi(
            marcFile.marc,
            marcFile.fileName,
            marcFile.jobProfileToRun,
          ).then((response) => {
            response.entries.forEach((record) => {
              createdRecordIDs.push(record[marcFile.propertyName].idList[0]);
            });
          });
        });

        cy.loginAsAdmin();
        cy.visit(TopMenu.inventoryPath).then(() => {
          InventoryInstances.searchByTitle(createdRecordIDs[0]);
          InventoryInstances.selectInstance();
          InventoryInstance.editMarcBibliographicRecord();
          InventoryInstance.verifyAndClickLinkIcon(testData.tag100);
          InventoryInstance.verifySelectMarcAuthorityModal();
          MarcAuthorities.switchToSearch();
          InventoryInstance.verifySearchOptions();
          InventoryInstance.searchResults(marcFiles[1].authorityHeading);
          MarcAuthorities.checkFieldAndContentExistence(
            testData.tag100,
            testData.authority100FieldValue,
          );
          InventoryInstance.clickLinkButton();
          QuickMarcEditor.verifyAfterLinkingAuthority(testData.tag100);
          QuickMarcEditor.verifyTagFieldAfterLinking(...testData.linked100Field);
          QuickMarcEditor.pressSaveAndClose();

          cy.createTempUser([
            Permissions.inventoryAll.gui,
            Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
            Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
            Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
            Permissions.uiQuickMarcQuickMarcAuthorityLinkUnlink.gui,
            Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
          ]).then((createdUserProperties) => {
            testData.userProperties = createdUserProperties;

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          });
        });
      });

      after('Delete test data', () => {
        cy.getAdminToken();
        InventoryInstance.deleteInstanceViaApi(createdRecordIDs[0]);
        MarcAuthority.deleteViaAPI(createdRecordIDs[1]);
        Users.deleteViaApi(testData.userProperties.userId);
      });

      it(
        'C376595 Verify that update of linked MARC authority "010 $a" (prefix deletion) will update linked bib fields "$0" with MARC authority "001" value (because it contains valid prefix) (spitfire) (TaaS)',
        { tags: ['extendedPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchAndVerify(testData.searchOption, marcFiles[1].authorityHeading);
          MarcAuthority.edit();
          cy.wait(2000);

          QuickMarcEditor.updateExistingField(testData.tag010, testData.tag010NewValue);
          QuickMarcEditor.checkButtonsEnabled();

          QuickMarcEditor.saveAndCloseUpdatedLinkedBibField();
          QuickMarcEditor.verifyAreYouSureModal(testData.areYouSureModalMessage);
          QuickMarcEditor.confirmUpdateLinkedBibs(1);

          MarcAuthorities.closeMarcViewPane();
          MarcAuthorities.checkRowsCount(1);
          MarcAuthorities.verifyNumberOfTitles(5, '1');

          MarcAuthorities.clickOnNumberOfTitlesLink(5, '1');
          InventoryInstance.checkInstanceTitle(marcFiles[0].instanceTitle);

          InventoryInstance.editMarcBibliographicRecord();
          QuickMarcEditor.verifyTagFieldAfterLinking(...testData.updated100Field);
        },
      );
    });
  });
});
