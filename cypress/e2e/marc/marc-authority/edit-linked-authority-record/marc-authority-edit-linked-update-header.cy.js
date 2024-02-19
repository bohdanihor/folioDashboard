import Permissions from '../../../../support/dictionary/permissions';
import DataImport from '../../../../support/fragments/data_import/dataImport';
import InventoryInstance from '../../../../support/fragments/inventory/inventoryInstance';
import InventoryInstances from '../../../../support/fragments/inventory/inventoryInstances';
import MarcAuthorities from '../../../../support/fragments/marcAuthority/marcAuthorities';
import MarcAuthority from '../../../../support/fragments/marcAuthority/marcAuthority';
import QuickMarcEditor from '../../../../support/fragments/quickMarcEditor';
import TopMenu from '../../../../support/fragments/topMenu';
import Users from '../../../../support/fragments/users/users';
import getRandomPostfix from '../../../../support/utils/stringTools';

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit linked Authority record', () => {
      const testData = {
        tag010: '010',
        tag155: '155',
        tag655: '655',
        updated155FieldValue: 'Drama C374159 cinema',
        updated010FieldValue: 'gf20140262973741590',
        autoUpdateUserName: 'Automated linking update',
        subjectAccordion: 'Subject',
        authorityIconText: 'Linked to MARC authority',
      };

      const marcFiles = [
        {
          marc: 'marcBibFileC374159.mrc',
          fileName: `testMarcFileC374159.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
          propertyName: 'relatedInstanceInfo',
          instanceTitle: 'Titanic / written and directed by James Cameron. C374159',
        },
        {
          marc: 'marcAuthFileC374159.mrc',
          fileName: `testMarcFileC374159.${getRandomPostfix()}.mrc`,
          jobProfileToRun: 'Default - Create SRS MARC Authority',
          propertyName: 'relatedAuthorityInfo',
          authorityHeading: 'Drama C374159',
          authority010FieldValue: 'gf2014026297374159',
          authority555FieldValue: 'Literature C374159',
        },
      ];

      const createdRecordIDs = [];

      before('Creating user, importing and linking records', () => {
        cy.createTempUser([
          Permissions.inventoryAll.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
          Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;

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

          cy.loginAsAdmin({
            path: TopMenu.inventoryPath,
            waiter: InventoryInstances.waitContentLoading,
          }).then(() => {
            InventoryInstances.waitContentLoading();
            InventoryInstances.searchByTitle(createdRecordIDs[0]);
            InventoryInstances.selectInstance();
            // wait for detail view to be fully loaded
            cy.wait(1500);
            InventoryInstance.editMarcBibliographicRecord();
            InventoryInstance.verifyAndClickLinkIcon(testData.tag655);
            MarcAuthorities.switchToSearch();
            InventoryInstance.verifySelectMarcAuthorityModal();
            InventoryInstance.searchResults(marcFiles[1].authorityHeading);
            MarcAuthorities.checkFieldAndContentExistence(
              testData.tag010,
              `$a ${marcFiles[1].authority010FieldValue}`,
            );
            InventoryInstance.clickLinkButton();
            QuickMarcEditor.verifyAfterLinkingAuthority(testData.tag655);
            QuickMarcEditor.pressSaveAndClose();
            QuickMarcEditor.checkAfterSaveAndClose();
          });
          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.marcAuthorities,
            waiter: MarcAuthorities.waitLoading,
          });
        });
      });

      after('Deleting user, data', () => {
        cy.getAdminToken();
        Users.deleteViaApi(testData.userProperties.userId);
        createdRecordIDs.forEach((id, index) => {
          if (index) MarcAuthority.deleteViaAPI(id);
          else InventoryInstance.deleteInstanceViaApi(id);
        });
      });

      it(
        'C374159 Edit values in "1XX" and "010" fields of linked "MARC Authority" record when "$0" = "010 $a" (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchBy('Keyword', marcFiles[1].authority555FieldValue);
          MarcAuthorities.selectTitle(marcFiles[1].authority555FieldValue);
          MarcAuthority.edit();
          QuickMarcEditor.updateExistingField(
            testData.tag155,
            `$a ${testData.updated155FieldValue}`,
          );
          QuickMarcEditor.checkButtonsEnabled();
          QuickMarcEditor.updateExistingField(
            testData.tag010,
            `$a ${testData.updated010FieldValue}`,
          );
          QuickMarcEditor.saveAndCloseUpdatedLinkedBibField();
          QuickMarcEditor.confirmUpdateLinkedBibs(1);
          MarcAuthorities.searchBy('Keyword', testData.updated155FieldValue);
          MarcAuthorities.checkResultList([testData.updated155FieldValue]);
          MarcAuthorities.verifyNumberOfTitles(5, '1');
          MarcAuthorities.clickOnNumberOfTitlesLink(5, '1');

          InventoryInstance.checkInstanceTitle(marcFiles[0].instanceTitle);
          InventoryInstance.verifyRecordStatus(testData.autoUpdateUserName);
          InventoryInstance.verifyInstanceSubject(
            11,
            0,
            `${testData.authorityIconText}${testData.updated155FieldValue}`,
          );
          InventoryInstance.checkExistanceOfAuthorityIconInInstanceDetailPane(
            testData.subjectAccordion,
          );

          InventoryInstance.editMarcBibliographicRecord();
          QuickMarcEditor.checkPaneheaderContains(`Source: ${testData.autoUpdateUserName}`);
          QuickMarcEditor.verifyTagFieldAfterLinking(
            52,
            '655',
            '\\',
            '7',
            `$a ${testData.updated155FieldValue}`,
            '',
            `$0 http://id.loc.gov/authorities/genreForms/${testData.updated010FieldValue}`,
            '$2 fast',
          );
        },
      );
    });
  });
});
