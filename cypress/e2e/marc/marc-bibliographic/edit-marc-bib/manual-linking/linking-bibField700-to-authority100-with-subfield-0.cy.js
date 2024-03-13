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
import MarcAuthoritiesSearch from '../../../../../support/fragments/marcAuthority/marcAuthoritiesSearch';
import InstanceRecordView from '../../../../../support/fragments/inventory/instanceRecordView';
import InventoryViewSource from '../../../../../support/fragments/inventory/inventoryViewSource';

describe('MARC', () => {
  describe('MARC Bibliographic', () => {
    describe('Edit MARC bib', () => {
      describe('Manual linking', () => {
        const testData = {
          createdRecordIDs: [],
          filterStateTag100: [
            'advancedSearch',
            'keyword exactPhrase C380742 Lee, Stan, 1922-2018, or identifiers.value exactPhrase n83169267',
          ],
          authority010FieldValue: 'n  83169267',
          authority100FieldValue: 'C380742 Lee, Stan,',
          tag100: '100',
          linkButtonToolTipText: 'Link "C380742 Lee, Stan, 1922-2018"',
          successMsg:
            'This record has successfully saved and is in process. Changes may not appear immediately.',
          accordion: 'Contributor',
          contributorName: '1922-2018 Lee, Stan,',
          marcAuthIcon: 'Linked to MARC authority',
        };

        const field700 = {
          tag: '700',
          rowIndex: 79,
          content: [
            79,
            '700',
            '1',
            '\\',
            '$a C380742 Lee, Stan, $d 1922-2018, $e creator. $0 http://id.loc.gov/authorities/names/n83169267',
          ],
          updatedContent:
            '$d C380742 Lee, Stan, $t 1922-2018, $e creator. $0 http://id.loc.gov/authorities/names/n83169267',
          contentAfterLinking: [
            79,
            '700',
            '1',
            '\\',
            '$a C380742 Lee, Stan, $d 1922-2018',
            '$e creator.',
            '$0 http://id.loc.gov/authorities/names/n83169267',
            '',
          ],
          contentAfterUnlinking: [
            79,
            '700',
            '1',
            '\\',
            '$a C380742 Lee, Stan, $d 1922-2018 $e creator. $0 http://id.loc.gov/authorities/names/n83169267',
          ],
        };

        const marcFiles = [
          {
            marc: 'marcBibFileForC380742.mrc',
            fileName: `C380742 testMarcFile${getRandomPostfix()}.mrc`,
            jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
            numOfRecords: 1,
            propertyName: 'relatedInstanceInfo',
          },
          {
            marc: 'marcAuthFileForC380742.mrc',
            fileName: `C380742 testMarcFile${getRandomPostfix()}.mrc`,
            jobProfileToRun: 'Default - Create SRS MARC Authority',
            numOfRecords: 1,
            propertyName: 'relatedAuthorityInfo',
          },
        ];

        before('Creating user', () => {
          // make sure there are no duplicate authority records in the system
          cy.getAdminToken().then(() => {
            MarcAuthorities.getMarcAuthoritiesViaApi({
              limit: 100,
              query: 'keyword="C380742"',
            }).then((records) => {
              records.forEach((record) => {
                if (record.authRefType === 'Authorized') {
                  MarcAuthority.deleteViaAPI(record.id);
                }
              });
            });
          });
          cy.createTempUser([
            Permissions.inventoryAll.gui,
            Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
            Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
            Permissions.uiQuickMarcQuickMarcAuthorityLinkUnlink.gui,
          ]).then((userProperties) => {
            testData.user = userProperties;

            cy.getAdminToken();
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

            cy.login(testData.user.username, testData.user.password, {
              path: TopMenu.inventoryPath,
              waiter: InventoryInstances.waitContentLoading,
            });
          });
        });

        after('Deleting created user', () => {
          cy.getAdminToken();
          Users.deleteViaApi(testData.user.userId);
          testData.createdRecordIDs.forEach((id, index) => {
            if (index) MarcAuthority.deleteViaAPI(id);
            else InventoryInstance.deleteInstanceViaApi(id);
          });
        });

        it(
          'C380742 Link "MARC Bib" field with "$0" subfield matched to "MARC Authority" record. "Authority source file" value from the pre-defined list (700 field to 100) (spitfire) (TaaS)',
          { tags: ['extendedPath', 'spitfire'] },
          () => {
            InventoryInstances.searchByTitle(testData.createdRecordIDs[0]);
            InventoryInstances.selectInstance();
            InventoryInstance.editMarcBibliographicRecord();
            QuickMarcEditor.checkLinkButtonExistByRowIndex(field700.rowIndex);
            QuickMarcEditor.verifyTagFieldAfterUnlinking(...field700.content);
            QuickMarcEditor.clickLinkIconInTagField(field700.rowIndex);
            InventoryInstance.verifySelectMarcAuthorityModal();
            MarcAuthoritiesSearch.verifyFiltersState(
              testData.filterStateTag100[0],
              testData.filterStateTag100[1],
              'Search',
            );
            MarcAuthority.contains(testData.authority010FieldValue);
            MarcAuthority.contains(testData.authority100FieldValue);
            InventoryInstance.closeFindAuthorityModal();
            QuickMarcEditor.updateExistingFieldContent(field700.rowIndex, field700.updatedContent);

            QuickMarcEditor.clickLinkIconInTagField(field700.rowIndex);
            InventoryInstance.verifySelectMarcAuthorityModal();
            MarcAuthoritiesSearch.verifyFiltersState(
              testData.filterStateTag100[0],
              testData.filterStateTag100[1],
              'Search',
            );
            MarcAuthority.contains(testData.authority010FieldValue);
            MarcAuthority.contains(testData.authority100FieldValue);

            MarcAuthorities.checkLinkButtonToolTipText(testData.linkButtonToolTipText);
            InventoryInstance.clickLinkButton();
            QuickMarcEditor.verifyAfterLinkingUsingRowIndex(field700.tag, field700.rowIndex);
            QuickMarcEditor.verifyTagFieldAfterLinking(...field700.contentAfterLinking);
            QuickMarcEditor.pressSaveAndKeepEditing(testData.successMsg);
            QuickMarcEditor.checkViewMarcAuthorityTooltipText(field700.rowIndex);
            QuickMarcEditor.clickViewMarcAuthorityIconInTagField(field700.rowIndex);
            MarcAuthorities.checkFieldAndContentExistence(
              testData.tag100,
              testData.authority100FieldValue,
            );
            cy.go('back');
            QuickMarcEditor.closeEditorPane();
            InstanceRecordView.verifyInstancePaneExists();
            InventoryInstance.verifyContributorWithMarcAppLink(
              5,
              1,
              `${testData.marcAuthIcon}C380742 Lee, Stan, 1922-2018`,
            );
            InventoryInstance.checkExistanceOfAuthorityIconInInstanceDetailPane(testData.accordion);
            InventoryInstance.clickViewAuthorityIconDisplayedInInstanceDetailsPane(
              testData.accordion,
            );
            MarcAuthorities.checkFieldAndContentExistence(
              testData.tag100,
              testData.authority100FieldValue,
            );
            cy.go('back');
            InstanceRecordView.verifyInstancePaneExists();
            InventoryInstance.viewSource();
            InventoryViewSource.verifyLinkedToAuthorityIcon(field700.rowIndex);
            InventoryViewSource.clickViewMarcAuthorityIcon();
            MarcAuthorities.checkDetailViewIncludesText('C380742 Lee, Stan');
            cy.go('back');
            InventoryViewSource.close();

            InstanceRecordView.verifyInstancePaneExists();
            InventoryInstance.editMarcBibliographicRecord();
            QuickMarcEditor.verifyRowLinked(field700.rowIndex);
            QuickMarcEditor.clickUnlinkIconInTagField(field700.rowIndex);
            QuickMarcEditor.confirmUnlinkingField();
            QuickMarcEditor.verifyTagFieldAfterUnlinking(...field700.contentAfterUnlinking);
            QuickMarcEditor.verifyIconsAfterUnlinking(field700.rowIndex);
            QuickMarcEditor.pressSaveAndClose();
            QuickMarcEditor.checkCallout(testData.successMsg);

            InstanceRecordView.verifyInstancePaneExists();
            InventoryInstance.verifyContributorAbsent(testData.contributorName);
            InventoryInstance.viewSource();
            InventoryViewSource.verifyLinkedToAuthorityIcon(field700.rowIndex, false);
          },
        );
      });
    });
  });
});
