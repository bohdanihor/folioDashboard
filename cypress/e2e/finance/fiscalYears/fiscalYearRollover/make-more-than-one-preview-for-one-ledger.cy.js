import permissions from '../../../../support/dictionary/permissions';
import testType from '../../../../support/dictionary/testTypes';
import devTeams from '../../../../support/dictionary/devTeams';
import getRandomPostfix from '../../../../support/utils/stringTools';
import FiscalYears from '../../../../support/fragments/finance/fiscalYears/fiscalYears';
import TopMenu from '../../../../support/fragments/topMenu';
import Ledgers from '../../../../support/fragments/finance/ledgers/ledgers';
import Users from '../../../../support/fragments/users/users';
import Funds from '../../../../support/fragments/finance/funds/funds';
import FinanceHelp from '../../../../support/fragments/finance/financeHelper';
import DateTools from '../../../../support/utils/dateTools';
import NewOrder from '../../../../support/fragments/orders/newOrder';
import Orders from '../../../../support/fragments/orders/orders';
import OrderLines from '../../../../support/fragments/orders/orderLines';
import Organizations from '../../../../support/fragments/organizations/organizations';
import NewOrganization from '../../../../support/fragments/organizations/newOrganization';
import ServicePoints from '../../../../support/fragments/settings/tenant/servicePoints/servicePoints';
import NewLocation from '../../../../support/fragments/settings/tenant/locations/newLocation';

describe('ui-finance: Fiscal Year Rollover', () => {
  const firstFiscalYear = { ...FiscalYears.defaultRolloverFiscalYear };
  const secondFiscalYear = {
    name: `autotest_year_${getRandomPostfix()}`,
    code: DateTools.getRandomFiscalYearCodeForRollover(2000, 9999),
    periodStart: `${DateTools.getCurrentDateForFiscalYear()}T00:00:00.000+00:00`,
    periodEnd: `${DateTools.getDayAfterTomorrowDateForFiscalYear()}T00:00:00.000+00:00`,
    description: `This is fiscal year created by E2E test automation script_${getRandomPostfix()}`,
    series: 'FY',
  };
  const defaultLedger = { ...Ledgers.defaultUiLedger };
  const defaultFund = { ...Funds.defaultUiFund };
  const firstOrder = {
    ...NewOrder.defaultOneTimeOrder,
    orderType: 'Ongoing',
    ongoing: { isSubscription: false, manualRenewal: false },
    approved: true,
    reEncumber: true,
  };
  const organization = { ...NewOrganization.defaultUiOrganizations };
  const allocatedQuantity = '1000';
  const todayDate = DateTools.getCurrentDate();
  const fileNameDate = DateTools.getCurrentDateForFileNaming();
  let user;
  let servicePointId;
  let location;

  before(() => {
    cy.getAdminToken();
    // create first Fiscal Year and prepere 2 Funds for Rollover
    FiscalYears.createViaApi(firstFiscalYear).then((firstFiscalYearResponse) => {
      firstFiscalYear.id = firstFiscalYearResponse.id;
      defaultLedger.fiscalYearOneId = firstFiscalYear.id;
      Ledgers.createViaApi(defaultLedger).then((ledgerResponse) => {
        defaultLedger.id = ledgerResponse.id;
        defaultFund.ledgerId = defaultLedger.id;

        Funds.createViaApi(defaultFund).then((fundResponse) => {
          defaultFund.id = fundResponse.fund.id;

          cy.loginAsAdmin({ path: TopMenu.fundPath, waiter: Funds.waitLoading });
          FinanceHelp.searchByName(defaultFund.name);
          Funds.selectFund(defaultFund.name);
          Funds.addBudget(allocatedQuantity);
        });
      });
    });
    ServicePoints.getViaApi().then((servicePoint) => {
      servicePointId = servicePoint[0].id;
      NewLocation.createViaApi(NewLocation.getDefaultLocation(servicePointId)).then((res) => {
        location = res;
      });
    });
    // Create second Fiscal Year for Rollover
    FiscalYears.createViaApi(secondFiscalYear).then((secondFiscalYearResponse) => {
      secondFiscalYear.id = secondFiscalYearResponse.id;
    });

    Organizations.createOrganizationViaApi(organization).then((responseOrganizations) => {
      organization.id = responseOrganizations;
    });
    firstOrder.vendor = organization.name;
    cy.visit(TopMenu.ordersPath);
    Orders.createApprovedOrderForRollover(firstOrder, true).then((firstOrderResponse) => {
      firstOrder.id = firstOrderResponse.id;
      Orders.checkCreatedOrder(firstOrder);
      OrderLines.addPOLine();
      OrderLines.selectRandomInstanceInTitleLookUP('*', 25);
      OrderLines.rolloverPOLineInfoforPhysicalMaterialWithFund(
        defaultFund,
        '10',
        '1',
        '10',
        location.institutionId,
      );
      OrderLines.backToEditingOrder();
      Orders.openOrder();
    });
    cy.createTempUser([
      permissions.uiFinanceExecuteFiscalYearRollover.gui,
      permissions.uiFinanceViewFiscalYear.gui,
      permissions.uiFinanceViewFundAndBudget.gui,
      permissions.uiFinanceViewLedger.gui,
    ]).then((userProperties) => {
      user = userProperties;
      cy.login(userProperties.username, userProperties.password, {
        path: TopMenu.ledgerPath,
        waiter: Ledgers.waitForLedgerDetailsLoading,
      });
    });
  });

  after(() => {
    cy.getAdminToken();
    Users.deleteViaApi(user.userId);
  });

  it(
    'C359604: Make more than one preview for one ledger and same fiscal year with "Test rollover", check test rollover results (thunderjet) (TaaS)',
    { tags: [testType.criticalPath, devTeams.thunderjet] },
    () => {
      FinanceHelp.searchByName(defaultLedger.name);
      Ledgers.selectLedger(defaultLedger.name);
      Ledgers.rollover();
      Ledgers.fillInTestRolloverInfoForOngoingOrdersWithAllocations(
        secondFiscalYear.code,
        'None',
        'Transfer',
        'Initial encumbrance',
      );
      Ledgers.rolloverLogs();
      Ledgers.exportRollover(todayDate);
      cy.pause();
      Ledgers.checkDownloadedFile(
        `${fileNameDate}-result.csv`,
        defaultFund,
        secondFiscalYear,
        '1000',
        '1000',
        '160',
        '160',
        '160',
        '160',
        '160',
      );
      Ledgers.deleteDownloadedFile(`${fileNameDate}-result.csv`);
      Ledgers.closeOpenedPage();
      Ledgers.rollover();
      Ledgers.fillInRolloverInfoForOngoingOrdersWithAllocations(
        secondFiscalYear.code,
        'None',
        'Transfer',
        'Initial encumbrance',
      );
      Ledgers.closeRolloverInfo();
      Ledgers.selectFundInLedger(defaultFund.name);
      Funds.selectPlannedBudgetDetails();
      Funds.checkFundingInformation('$160.00', '$0.00', '$0.00', '$160.00', '$0.00', '$160.00');
      Funds.checkFinancialActivityAndOverages('$0.00', '$0.00', '$0.00', '$0.00');
    },
  );
});
