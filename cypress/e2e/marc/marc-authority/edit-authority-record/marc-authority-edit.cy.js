import Permissions from '../../../../support/dictionary/permissions';
import DataImport from '../../../../support/fragments/data_import/dataImport';
import MarcAuthorities from '../../../../support/fragments/marcAuthority/marcAuthorities';
import MarcAuthority from '../../../../support/fragments/marcAuthority/marcAuthority';
import QuickMarcEditor from '../../../../support/fragments/quickMarcEditor';
import MarcFieldProtection from '../../../../support/fragments/settings/dataImport/marcFieldProtection';
import TopMenu from '../../../../support/fragments/topMenu';
import Users from '../../../../support/fragments/users/users';
import getRandomPostfix, { replaceByIndex } from '../../../../support/utils/stringTools';

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authority: {
          title: 'Twain, Mark, 1835-1910. Adventures of Huckleberry Finn',
          searchOption: 'Keyword',
          tag: '100',
          rowIndex: 14,
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          { marc: 'marcFileForC350901.mrc', fileName: `testMarcFile.${getRandomPostfix()}.mrc` },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C350901 Add multiple / delete 1XX tag of "MARC Authority" record (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchBy(testData.authority.searchOption, testData.authority.title);
          MarcAuthorities.selectTitle(testData.authority.title);
          MarcAuthority.edit();
          MarcAuthority.changeTag(testData.authority.rowIndex, '');
          MarcAuthority.deleteTag(testData.authority.rowIndex);
          MarcAuthority.clicksaveAndCloseButton();
          MarcAuthority.checkRemoved1XXTag();
          QuickMarcEditor.undoDelete();
          MarcAuthority.changeTag(testData.authority.rowIndex, testData.authority.tag);
          QuickMarcEditor.checkContentByTag(
            '$a Twain, Mark, $d 1835-1910. $t Adventures of Huckleberry Finn',
            testData.authority.tag,
          );
          MarcAuthority.checkAddNew1XXTag(
            testData.authority.rowIndex,
            testData.authority.tag,
            '$a C350901',
          );
          QuickMarcEditor.closeWithoutSavingAfterChange();
          MarcAuthorities.selectTitle(testData.authority.title);
          MarcAuthority.contains(testData.authority.title);
        },
      );
    });
  });
});

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authority: {
          title: 'C375120Twain, Mark, 1835-1910. Adventures of Huckleberry Finn',
          searchOption: 'Keyword',
          tag: '100',
          rowIndex: 14,
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const tagsC375120 = ['110', '111', '130', '150', '151'];
      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          {
            marc: 'marcFileForC375120.mrc',
            fileName: `C375120testMarcFile.${getRandomPostfix()}.mrc`,
          },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C375120 User cannot delete "1XX" field of "MARC authority" record (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          const rowIndexTag1XX = 14;
          MarcAuthorities.searchBy(testData.authority.searchOption, testData.authority.title);
          MarcAuthorities.selectTitle(testData.authority.title);
          MarcAuthority.edit();

          tagsC375120.forEach((tag) => {
            MarcAuthority.changeTag(rowIndexTag1XX, tag);
            QuickMarcEditor.clickSaveAndKeepEditing();
            QuickMarcEditor.checkDeleteButtonNotExist(rowIndexTag1XX);
          });

          MarcAuthority.changeTag(rowIndexTag1XX, '110');
          QuickMarcEditor.pressSaveAndClose();
          MarcAuthority.edit();

          MarcAuthority.addNewField(rowIndexTag1XX, '100', '$a test');
          MarcAuthority.changeTag(rowIndexTag1XX + 1, '400');
          QuickMarcEditor.checkDeleteButtonExist(rowIndexTag1XX + 1);
        },
      );
    });
  });
});

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authority: {
          title: 'C387460Twain, Mark, 1835-1910. Adventures of Huckleberry Finn',
          searchOption: 'Keyword',
          tag: '100',
          rowIndex: 14,
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          {
            marc: 'marcFileForC387460.mrc',
            fileName: `C387460testMarcFile.${getRandomPostfix()}.mrc`,
          },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C387460 Add multiple 001s when editing "MARC Authority" record (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchBy(testData.authority.searchOption, testData.authority.title);
          MarcAuthorities.selectTitle(testData.authority.title);
          MarcAuthority.edit();
          MarcAuthority.checkAddNew001Tag(4, '$a test');
          MarcAuthority.waitLoading();
          MarcAuthority.edit();
          MarcAuthority.checkTagInRowDoesntExist(5, '001');
        },
      );
    });
  });
});

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authority: {
          title: 'C353533Twain, Mark, 1835-1910. Adventures of Huckleberry Finn',
          searchOption: 'Keyword',
          tag: '100',
          rowIndex: 14,
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const newFieldsArr = [
        ['245', '1', '\\', '$a Added row (must indicate)'],
        ['260', '1', '1', '$b Added row (not indicate)'],
        ['520', '\\', '\\', '$a Added row (must indicate)'],
        ['655', '1', '1', '$b Added row (must indicate)'],
        ['655', '2', '1', '$b Added row (not indicate)'],
        ['655', '1', '2', '$a Added row (not indicate)'],
        ['655', '\\', '\\', '$a Added row (must indicate)'],
      ];
      const protectedMARCFields = [
        ['245', '*', '*', 'a', '*'],
        ['260', '1', '1', 'b', 'must indicate'],
        ['520', '*', '*', '*', '*'],
        ['655', '1', '*', 'b', '*'],
        ['655', '*', '*', '*', 'Added row (must indicate)'],
      ];
      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          {
            marc: 'marcFileForC353533.mrc',
            fileName: `C353533testMarcFile.${getRandomPostfix()}.mrc`,
          },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C353533 Protection of specified fields when editing "MARC Authority" record (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchBy(testData.authority.searchOption, testData.authority.title);
          MarcAuthorities.selectTitle(testData.authority.title);
          MarcAuthority.edit();
          MarcAuthority.checkInfoButton('999');
          newFieldsArr.forEach((field) => {
            MarcAuthority.addNewField(10, field[0], field[3], field[1], field[2]);
          });
          QuickMarcEditor.pressSaveAndClose();
          cy.getAdminToken();
          protectedMARCFields.forEach((marcFieldProtectionRule) => {
            MarcFieldProtection.createViaApi({
              indicator1: marcFieldProtectionRule[1],
              indicator2: marcFieldProtectionRule[2],
              subfield: marcFieldProtectionRule[3],
              data: marcFieldProtectionRule[4],
              source: 'USER',
              field: marcFieldProtectionRule[0],
            }).then((response) => {
              marcFieldProtectionRules.push(response.id);
            });
          });

          MarcAuthority.edit();
          MarcAuthority.checkInfoButton('655', 11);
          MarcAuthority.checkInfoButton('655', 14);
          MarcAuthority.checkInfoButton('245');
          MarcAuthority.checkInfoButton('520');
          MarcAuthority.checkInfoButton('999');
        },
      );
    });
  });
});

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authority: {
          title: 'C353583Twain, Mark, 1835-1910. Adventures of Huckleberry Finn',
          searchOption: 'Keyword',
          tag: '100',
          rowIndex: 14,
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const initialLDRValue = String.raw`03891cz\\a2200505n\\4500`;
      const changesSavedCallout =
        'This record has successfully saved and is in process. Changes may not appear immediately.';
      const changedLDRs = [
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'a'), 17, 'n'),
            18,
            '\\',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'c'), 17, 'o'),
            18,
            ' ',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'd'), 17, 'n'),
            18,
            'c',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'n'), 17, 'o'),
            18,
            'i',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'o'), 17, 'n'),
            18,
            'u',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 's'), 17, 'o'),
            18,
            'c',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'x'), 17, 'n'),
            18,
            'i',
          ),
        },
      ];

      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          {
            marc: 'marcFileForC353583.mrc',
            fileName: `C353583testMarcFile.${getRandomPostfix()}.mrc`,
          },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C353583 Verify LDR validation rules with valid data (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchBy(testData.authority.searchOption, testData.authority.title);
          MarcAuthorities.selectTitle(testData.authority.title);
          changedLDRs.forEach((changeLDR) => {
            MarcAuthority.edit();
            QuickMarcEditor.updateExistingField('LDR', changeLDR.newContent);
            QuickMarcEditor.pressSaveAndClose();
            if (changeLDR.newContent === String.raw`03891az\\a2200505n\\4500`) {
              MarcAuthorities.verifyFirstValueSaveSuccess(
                changesSavedCallout,
                changeLDR.newContent,
              );
            } else MarcAuthorities.verifySaveSuccess(changesSavedCallout, changeLDR.newContent);
          });
        },
      );
    });
  });
});

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authority: {
          title: 'C353585Twain, Mark, 1835-1910. Adventures of Huckleberry Finn',
          searchOption: 'Keyword',
          tag: '100',
          rowIndex: 14,
        },
        authorityB: {
          title: 'Beethoven, Ludwig van (no 010)',
          searchOption: 'Keyword',
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const initialLDRValue = String.raw`03926cz\\a2200505n\\4500`;
      let changedLDRs = [
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'a'), 17, 'n'),
            18,
            '\\',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'c'), 17, 'o'),
            18,
            ' ',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'd'), 17, 'n'),
            18,
            'c',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'n'), 17, 'o'),
            18,
            'i',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'o'), 17, 'n'),
            18,
            'u',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 's'), 17, 'o'),
            18,
            'c',
          ),
        },
        {
          newContent: replaceByIndex(
            replaceByIndex(replaceByIndex(initialLDRValue, 5, 'x'), 17, 'n'),
            18,
            'i',
          ),
        },
      ];
      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          {
            marc: 'marcFileForC353585.mrc',
            fileName: `C353585testMarcFile.${getRandomPostfix()}.mrc`,
          },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C353585 Verify LDR validation rules with invalid data (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          const wrongPositionError =
            'Record cannot be saved. Please check the Leader. Only positions 5, 17, 18 can be edited in the Leader.';
          const positions5Error =
            'Record cannot be saved. Please enter a valid Leader 05. Valid values are listed at https://www.loc.gov/marc/authority/adleader.html';
          const position17Error =
            'Record cannot be saved. Please enter a valid Leader 17. Valid values are listed at https://www.loc.gov/marc/authority/adleader.html';
          const positions18Error =
            'Record cannot be saved. Please enter a valid Leader 18. Valid values are listed at https://www.loc.gov/marc/authority/adleader.html';

          changedLDRs = [
            { newContent: replaceByIndex(initialLDRValue, 4, 3), errorMessage: wrongPositionError },
            {
              newContent: replaceByIndex(initialLDRValue, 6, 'a'),
              errorMessage: wrongPositionError,
            },
            {
              newContent: replaceByIndex(initialLDRValue, 16, 2),
              errorMessage: wrongPositionError,
            },
            {
              newContent: replaceByIndex(initialLDRValue, 19, 't'),
              errorMessage: wrongPositionError,
            },
            { newContent: replaceByIndex(initialLDRValue, 5, 'w'), errorMessage: positions5Error },
            { newContent: replaceByIndex(initialLDRValue, 17, 'p'), errorMessage: position17Error },
            {
              newContent: replaceByIndex(initialLDRValue, 18, 'q'),
              errorMessage: positions18Error,
            },
          ];

          MarcAuthorities.searchBy(testData.authority.searchOption, testData.authority.title);
          MarcAuthorities.selectTitle(testData.authority.title);
          MarcAuthority.edit();
          // Waiter needed for the whole page to be loaded.
          cy.wait(2000);
          changedLDRs.forEach((changeLDR) => {
            QuickMarcEditor.updateExistingField('LDR', changeLDR.newContent);
            QuickMarcEditor.pressSaveAndClose();
            QuickMarcEditor.checkCallout(changeLDR.errorMessage);
          });
        },
      );
    });
  });
});

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authority: {
          title: 'C356840Twain, Mark, 1835-1910. Adventures of Huckleberry Finn',
          searchOption: 'Keyword',
          tag: '100',
          rowIndex: 14,
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          {
            marc: 'marcFileForC356840.mrc',
            fileName: `C356840testMarcFile.${getRandomPostfix()}.mrc`,
          },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C356840 Verify that the "Save & close" button enabled when user make changes in the record. (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchBy(testData.authority.searchOption, testData.authority.title);
          MarcAuthorities.selectTitle(testData.authority.title);
          MarcAuthority.edit();
          // Waiter needed for the whole page to be loaded.
          cy.wait(2000);
          MarcAuthority.addNewField(7, '555', '$a test');
          QuickMarcEditor.checkButtonSaveAndCloseEnable();
          MarcAuthority.addNewField(7, '555', '$a test');
          QuickMarcEditor.checkButtonSaveAndCloseEnable();
          MarcAuthority.addNewField(7, '555', '$a test');
          QuickMarcEditor.checkButtonSaveAndCloseEnable();
          MarcAuthority.deleteTag(8);
          QuickMarcEditor.checkButtonSaveAndCloseEnable();
          MarcAuthority.deleteTag(8);
          QuickMarcEditor.checkButtonSaveAndCloseEnable();
          MarcAuthority.deleteTag(8);
          MarcAuthority.deleteTag(8);
          QuickMarcEditor.pressSaveAndClose();
          QuickMarcEditor.confirmDelete();
          MarcAuthorities.waitLoading();
        },
      );
    });
  });
});

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authorityB: {
          title: 'C375141Beethoven, Ludwig van (no 010)',
          searchOption: 'Keyword',
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          {
            marc: 'marcFileForC375141.mrc',
            fileName: `C375141testMarcFile.${getRandomPostfix()}.mrc`,
          },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C375141 Add/edit/delete "010" field of "MARC authority" record not linked to a "MARC bibliographic" record (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchAndVerify(
            testData.authorityB.searchOption,
            testData.authorityB.title,
          );
          MarcAuthority.edit();
          MarcAuthorities.check010FieldAbsence();
          MarcAuthority.addNewField(4, '010', '$a 123123');
          QuickMarcEditor.checkButtonsEnabled();
          QuickMarcEditor.clickSaveAndKeepEditing();
          QuickMarcEditor.updateExistingField('010', '$a n90635366');
          QuickMarcEditor.checkButtonsEnabled();
          QuickMarcEditor.clickSaveAndKeepEditing();
          // wait until all the saved and updated values will be loaded.
          cy.wait(3000);
          QuickMarcEditor.deleteFieldAndCheck(5, '010');
          QuickMarcEditor.checkButtonsEnabled();
          QuickMarcEditor.clickSaveAndCloseThenCheck(1);
          QuickMarcEditor.constinueWithSaveAndCheck();
        },
      );
    });
  });
});

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authorityB: {
          title: 'C359238Beethoven, Ludwig van (no 010)',
          searchOption: 'Keyword',
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const tags = ['381', '382', '379', ''];
      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          {
            marc: 'marcFileForC359238.mrc',
            fileName: `C359238testMarcFile.${getRandomPostfix()}.mrc`,
          },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C359238 MARC Authority | Displaying of placeholder message when user deletes a row (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchAndVerify(
            testData.authorityB.searchOption,
            testData.authorityB.title,
          );
          MarcAuthority.edit();

          // Waiter needed for the whole page to be loaded.
          cy.wait(2000);
          for (let i = 0; i < 4; i++) {
            QuickMarcEditor.addEmptyFields(4);
          }
          QuickMarcEditor.addValuesToExistingField(4, '', '$a');
          QuickMarcEditor.addValuesToExistingField(5, '251', '$a');
          QuickMarcEditor.addValuesToExistingField(6, '', '$a Filled');
          QuickMarcEditor.addValuesToExistingField(7, '400', '$a value');
          QuickMarcEditor.checkButtonsEnabled();
          for (let i = 0; i < 4; i++) {
            QuickMarcEditor.deleteField(5);
          }

          QuickMarcEditor.checkButtonsDisabled();
          QuickMarcEditor.deleteField(4);
          QuickMarcEditor.afterDeleteNotification('035');
          QuickMarcEditor.undoDelete();
          QuickMarcEditor.updateExistingTagValue(7, '381');
          QuickMarcEditor.updateExistingFieldContent(8, '$a Filled');
          QuickMarcEditor.updateExistingTagValue(9, '379');
          QuickMarcEditor.updateExistingFieldContent(9, '$a value');
          QuickMarcEditor.updateExistingTagValue(10, '');
          for (let i = 7; i < 11; i++) {
            QuickMarcEditor.deleteField(i);
          }

          tags.forEach((tag) => {
            QuickMarcEditor.afterDeleteNotification(tag);
          });
          for (let i = 0; i < 4; i++) {
            QuickMarcEditor.undoDelete();
          }

          QuickMarcEditor.deleteField(10);
          QuickMarcEditor.deleteField(11);
          QuickMarcEditor.afterDeleteNotification('');
          QuickMarcEditor.afterDeleteNotification('400');
          QuickMarcEditor.clickSaveAndCloseThenCheck(2);
          QuickMarcEditor.clickRestoreDeletedField();
          QuickMarcEditor.deleteField(8);
          QuickMarcEditor.deleteField(10);
          QuickMarcEditor.afterDeleteNotification('382');
          QuickMarcEditor.afterDeleteNotification('');
          QuickMarcEditor.clickSaveAndCloseThenCheck(2);
          QuickMarcEditor.constinueWithSaveAndCheck();
          QuickMarcEditor.checkFieldAbsense('382');
        },
      );
    });
  });
});

describe('MARC', () => {
  describe('MARC Authority', () => {
    describe('Edit Authority record', () => {
      const testData = {
        authority: {
          title: 'C375172Twain, Mark, 1835-1910. Adventures of Huckleberry Finn',
          searchOption: 'Keyword',
          tag: '100',
          rowIndex: 14,
        },
      };
      const jobProfileToRun = 'Default - Create SRS MARC Authority';
      const propertyName = 'relatedAuthorityInfo';
      const marcFieldProtectionRules = [];
      const createdAuthorityID = [];

      before('create test data', () => {
        const marcFiles = [
          {
            marc: 'marcFileForC375172.mrc',
            fileName: `C375172testMarcFile.${getRandomPostfix()}.mrc`,
          },
        ];
        cy.createTempUser([
          Permissions.uiMarcAuthoritiesAuthorityRecordEdit.gui,
          Permissions.uiMarcAuthoritiesAuthorityRecordView.gui,
          Permissions.uiQuickMarcQuickMarcAuthoritiesEditorAll.gui,
        ]).then((createdUserProperties) => {
          testData.userProperties = createdUserProperties;
        });

        cy.loginAsAdmin({ path: TopMenu.dataImportPath, waiter: DataImport.waitLoading }).then(
          () => {
            cy.getAdminToken();
            marcFiles.forEach((marcFile) => {
              DataImport.uploadFileViaApi(marcFile.marc, marcFile.fileName, jobProfileToRun).then(
                (response) => {
                  response.entries.forEach((record) => {
                    createdAuthorityID.push(record[propertyName].idList[0]);
                  });
                },
              );
            });

            cy.login(testData.userProperties.username, testData.userProperties.password, {
              path: TopMenu.marcAuthorities,
              waiter: MarcAuthorities.waitLoading,
            });
          },
        );
      });

      after('delete test data', () => {
        cy.getAdminToken();
        createdAuthorityID.forEach((id) => {
          MarcAuthority.deleteViaAPI(id);
        });
        Users.deleteViaApi(testData.userProperties.userId);
        marcFieldProtectionRules.forEach((ruleID) => {
          if (ruleID) MarcFieldProtection.deleteViaApi(ruleID);
        });
      });

      it(
        'C375172 Save "MARC authority" record with deleted field and updated fields (spitfire)',
        { tags: ['criticalPath', 'spitfire'] },
        () => {
          MarcAuthorities.searchBy(testData.authority.searchOption, testData.authority.title);
          MarcAuthorities.selectTitle(testData.authority.title);
          MarcAuthority.edit();
          // Waiter needed for the whole page to be loaded.
          cy.wait(2000);
          MarcAuthority.deleteTag(5);
          MarcAuthority.changeTag(6, '100');
          QuickMarcEditor.pressSaveAndClose();
          MarcAuthority.changeTag(6, '040');
          QuickMarcEditor.pressSaveAndClose();
          QuickMarcEditor.verifyConfirmModal();
          QuickMarcEditor.clickRestoreDeletedField();
          QuickMarcEditor.checkButtonsEnabled();
        },
      );
    });
  });
});
