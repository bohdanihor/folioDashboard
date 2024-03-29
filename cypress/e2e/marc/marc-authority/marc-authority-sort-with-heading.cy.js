import getRandomPostfix from '../../../support/utils/stringTools';
import Permissions from '../../../support/dictionary/permissions';
import TopMenu from '../../../support/fragments/topMenu';
import DataImport from '../../../support/fragments/data_import/dataImport';
import MarcAuthority from '../../../support/fragments/marcAuthority/marcAuthority';
import Users from '../../../support/fragments/users/users';
import MarcAuthorities from '../../../support/fragments/marcAuthority/marcAuthorities';

describe('MARC', () => {
  describe('MARC Authority', () => {
    const testData = {
      authority: {
        title: 'Type of heading test',
        searchOption: 'Keyword',
        all: '*',
      },

      columnHeaders: [
        { header: 'Authorized/Reference', index: 1 },
        { header: 'Heading/Reference', index: 2 },
        { header: 'Type of heading', index: 3 },
      ],
    };
    const marcFiles = [
      {
        marc: 'marcFileForC353607.mrc',
        fileName: `testMarcFile.${getRandomPostfix()}.mrc`,
        jobProfileToRun: 'Default - Create SRS MARC Authority',
        numOfRecords: 19,
        propertyName: 'relatedAuthorityInfo',
      },
    ];

    const createdAuthorityIDs = [];

    before(() => {
      cy.getAdminToken();
      marcFiles.forEach((marcFile) => {
        DataImport.uploadFileViaApi(
          marcFile.marc,
          marcFile.fileName,
          marcFile.jobProfileToRun,
        ).then((response) => {
          response.entries.forEach((record) => {
            createdAuthorityIDs.push(record[marcFile.propertyName].idList[0]);
          });
        });
      });

      cy.createTempUser([Permissions.uiMarcAuthoritiesAuthorityRecordView.gui]).then(
        (createdUserProperties) => {
          testData.userProperties = createdUserProperties;

          cy.login(testData.userProperties.username, testData.userProperties.password, {
            path: TopMenu.marcAuthorities,
            waiter: MarcAuthorities.waitLoading,
          });
        },
      );
    });

    after(() => {
      cy.getAdminToken();
      createdAuthorityIDs.forEach((id) => {
        MarcAuthority.deleteViaAPI(id);
      });
      Users.deleteViaApi(testData.userProperties.userId);
    });

    it(
      'C353607 The search result list is sorted by clicking on the titles of columns (TaaS) (spitfire)',
      { tags: ['extendedPath', 'spitfire'] },
      () => {
        MarcAuthorities.checkSearchOptions();
        MarcAuthorities.searchBy(testData.authority.searchOption, testData.authority.all);

        MarcAuthorities.clickActionsButton();
        MarcAuthorities.verifyActionsSortedBy('Relevance');
        testData.columnHeaders.forEach(({ header, index }) => {
          MarcAuthorities.clickOnColumnHeader(header);
          // wait for result list to be sorted
          cy.wait(2000);
          MarcAuthorities.checkResultListSortedByColumn(index);
          MarcAuthorities.clickOnColumnHeader(header);
          // wait for result list to be sorted
          cy.wait(2000);
          MarcAuthorities.checkResultListSortedByColumn(index, false);
          MarcAuthorities.verifyActionsSortedBy(header);
        });
      },
    );
  });
});
