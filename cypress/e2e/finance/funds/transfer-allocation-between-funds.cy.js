import { DevTeams, TestTypes, Permissions } from '../../../support/dictionary';
import {
  FiscalYears,
  FinanceHelper,
  Ledgers,
  Funds,
  Budgets,
  Transfers,
} from '../../../support/fragments/finance';
import TopMenu from '../../../support/fragments/topMenu';
import Users from '../../../support/fragments/users/users';

describe('Finance', () => {
  const testData = {
    user: {},
  };

  let fiscalYear;
  let ledger;
  let funds;
  let budgets;

  const createTestFunds = () => {
    fiscalYear = FiscalYears.getDefaultFiscalYear();
    ledger = { ...Ledgers.getDefaultLedger(), fiscalYearOneId: fiscalYear.id };
    funds = {
      first: { ...Funds.getDefaultFund(), ledgerId: ledger.id },
      second: { ...Funds.getDefaultFund(), ledgerId: ledger.id },
    };
    budgets = {
      first: {
        ...Budgets.getDefaultBudget(),
        allocated: 100,
        fiscalYearId: fiscalYear.id,
        fundId: funds.first.id,
      },
      second: {
        ...Budgets.getDefaultBudget(),
        allocated: 100,
        fiscalYearId: fiscalYear.id,
        fundId: funds.second.id,
      },
    };

    cy.getAdminToken().then(() => {
      FiscalYears.createViaApi(fiscalYear);
      Ledgers.createViaApi(ledger);
      Object.values(funds).forEach((fund) => {
        Funds.createViaApi(fund);
      });
      Object.values(budgets).forEach((budget) => {
        Budgets.createViaApi(budget);
      });
    });
  };

  before('Create test user', () => {
    cy.createTempUser([
      Permissions.uiFinanceCreateTransfers.gui,
      Permissions.uiFinanceViewFundAndBudget.gui,
    ]).then((userProperties) => {
      testData.user = userProperties;
    });
  });

  after('Delete test user', () => {
    cy.getAdminToken().then(() => {
      Users.deleteViaApi(testData.user.userId);
    });
  });

  describe('Funds', () => {
    beforeEach('Create test data', () => {
      createTestFunds();
      const transfer = Transfers.getDefaultTransfer({
        amount: 110,
        fromFundId: funds.second.id,
        toFundId: funds.first.id,
        fiscalYearId: fiscalYear.id,
      });
      Transfers.createTransferViaApi(transfer);

      cy.login(testData.user.username, testData.user.password, {
        path: TopMenu.fundPath,
        waiter: Funds.waitLoading,
      });
    });

    it(
      'C375066 Money transfer between funds is successful if budget "From" already has negative available amount (thunderjet) (TaaS)',
      { tags: [TestTypes.extendedPath, DevTeams.thunderjet] },
      () => {
        // Open Fund B from Preconditions
        FinanceHelper.searchByName(funds.second.name);
        const FundDetails = Funds.selectFund(funds.second.name);
        FundDetails.checkFundDetails({
          currentBudget: { name: budgets.second.name, allocated: '$100.00', available: '-$10.00' },
        });

        // Click on the record in "Current budget" accordion
        const BudgetDetails = FundDetails.openCurrentBudgetDetails();
        BudgetDetails.checkBudgetDetails({
          balance: { available: '-$10.00' },
        });

        // Click "Actions" button, Select "Transfer" option
        const AddTransferModal = BudgetDetails.openAddTransferModal();

        // Fill the following fields: "From", "To", "Amount"
        AddTransferModal.fillTransferDetails({
          fromFund: funds.second.name,
          toFund: funds.first.name,
          amount: '20',
        });

        // Click "Confirm" button
        AddTransferModal.clickConfirmButton({ confirmNegative: true });
        BudgetDetails.checkBudgetDetails({
          balance: { available: '-$30.00' },
        });

        // Close Budget details by clicking "X" button
        BudgetDetails.closeBudgetDetails();
        FundDetails.checkFundDetails({
          currentBudget: { name: budgets.second.name, allocated: '$100.00', available: '-$30.00' },
        });
      },
    );
  });
});
