import Permissions from '../../../../support/dictionary/permissions';
import DataImport from '../../../../support/fragments/data_import/dataImport';
import InventoryInstance from '../../../../support/fragments/inventory/inventoryInstance';
import InventoryInstances from '../../../../support/fragments/inventory/inventoryInstances';
import MarcAuthorities from '../../../../support/fragments/marcAuthority/marcAuthorities';
import MarcAuthority from '../../../../support/fragments/marcAuthority/marcAuthority';
import TopMenu from '../../../../support/fragments/topMenu';
import Users from '../../../../support/fragments/users/users';
import getRandomPostfix, { randomFourDigitNumber } from '../../../../support/utils/stringTools';

describe('MARC', () => {
  describe('plug-in MARC authority', () => {
    describe('plug-in MARC authority | Search', () => {
      const testData = {
        tag: '700',
        instanceTitle: 'The data for C360551',
        authTitle: 'Apple & Honey Productions',
        authSourceOptions: {
          NOT_SPECIFIED: 'Not specified',
        },
        authSearchOption: {
          GENRE: 'Genre',
        },
        absenceMessage: 'No results found for "Europe". Please check your spelling and filters.',
        instanceIDs: [],
        authorityIDs: [],
        marcFiles: [
          {
            marc: 'marcBibC360551.mrc',
            fileName: `testMarcFileBib360551.${getRandomPostfix()}.mrc`,
            jobProfileToRun: 'Default - Create instance and SRS MARC Bib',
            numberOfRecords: 1,
            propertyName: 'relatedInstanceInfo',
          },
          {
            marc: 'marcAuthC360551.mrc',
            fileName: `testMarcFileAuthC360551.${randomFourDigitNumber()}.mrc`,
            jobProfileToRun: 'Default - Create SRS MARC Authority',
            numberOfRecords: 13,
            propertyName: 'relatedAuthorityInfo',
          },
        ],
      };

      before('Creating user', () => {
        cy.createTempUser([
          Permissions.inventoryAll.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcBibliographicEditorAll.gui,
          Permissions.uiQuickMarcQuickMarcAuthorityLinkUnlink.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;

          InventoryInstances.getInstancesViaApi({
            limit: 100,
            query: `title="${testData.instanceTitle}"`,
          }).then((instances) => {
            if (instances) {
              instances.forEach(({ id }) => {
                InventoryInstance.deleteInstanceViaApi(id);
              });
            }
          });
          MarcAuthorities.getMarcAuthoritiesViaApi({
            limit: 100,
            query: 'keyword="C360551" and (authRefType==("Authorized" or "Auth/Ref"))',
          }).then((authorities) => {
            if (authorities) {
              authorities.forEach(({ id }) => {
                MarcAuthority.deleteViaAPI(id);
              });
            }
          });
        });
        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading })
          .then(() => {
            testData.marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(
                marcFile.marc,
                marcFile.fileName,
                marcFile.jobProfileToRun,
              ).then((response) => {
                response.entries.forEach((record) => {
                  if (marcFile.jobProfileToRun === 'Default - Create instance and SRS MARC Bib') {
                    testData.instanceIDs.push(record[marcFile.propertyName].idList[0]);
                  } else {
                    testData.authorityIDs.push(record[marcFile.propertyName].idList[0]);
                  }
                });
              });
            });
          })
          .then(() => {
            cy.logout();
            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.inventoryPath,
              waiter: InventoryInstances.waitContentLoading,
            });
            InventoryInstances.searchByTitle(testData.instanceTitle);
            InventoryInstances.selectInstance();
            InventoryInstance.editMarcBibliographicRecord();
            InventoryInstance.verifyAndClickLinkIcon(testData.tag);
            MarcAuthorities.switchToSearch();
            InventoryInstance.verifySelectMarcAuthorityModal();
          });
      });

      after('Deleting created user', () => {
        cy.getAdminToken();
        Users.deleteViaApi(testData.userProperties.userId);
        testData.instanceIDs.forEach((id) => {
          InventoryInstance.deleteInstanceViaApi(id);
        });
        testData.authorityIDs.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
      });

      it(
        'C360551 MARC Authority plug-in | Search: Verify that the "Authority source" facet option will display the name of facet option when zero results are returned (spitfire) (TaaS)',
        { tags: ['extendedPath', 'spitfire'] },
        () => {
          MarcAuthorities.checkAuthoritySourceOptions();
          MarcAuthorities.chooseAuthoritySourceOption(testData.authSourceOptions.NOT_SPECIFIED);
          MarcAuthorities.checkSelectedAuthoritySource(testData.authSourceOptions.NOT_SPECIFIED);
          MarcAuthorities.verifySearchResultTabletIsAbsent(false);

          MarcAuthorities.searchByParameter(testData.authSearchOption.GENRE, 'Europe');
          MarcAuthorities.verifySearchResultTabletIsAbsent(true);

          MarcAuthorities.checkNoResultsMessage(testData.absenceMessage);
          MarcAuthorities.checkTotalRecordsForOption(testData.authSourceOptions.NOT_SPECIFIED, 0);
        },
      );
    });
  });
});
