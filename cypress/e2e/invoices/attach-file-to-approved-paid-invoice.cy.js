import { INVOICE_STATUSES } from '../../support/constants';
import { Permissions } from '../../support/dictionary';
import { Budgets } from '../../support/fragments/finance';
import { InvoiceView, Invoices } from '../../support/fragments/invoices';
import { BasicOrderLine, NewOrder, OrderLines, Orders } from '../../support/fragments/orders';
import { NewOrganization, Organizations } from '../../support/fragments/organizations';
import TopMenu from '../../support/fragments/topMenu';
import Users from '../../support/fragments/users/users';
import FileManager from '../../support/utils/fileManager';
import getRandomPostfix from '../../support/utils/stringTools';

describe('Invoices', () => {
  const testData = {
    fileName: `autotes_file_name_${getRandomPostfix()}`,
    organization: NewOrganization.getDefaultOrganization(),
    order: {},
    orderLine: {},
    invoice: {},
    user: {},
  };

  before('Create test data', () => {
    cy.getAdminToken().then(() => {
      FileManager.createFile(`cypress/fixtures/${testData.fileName}`, '[C360544] Data for test');

      const { fiscalYear, fund } = Budgets.createBudgetWithFundLedgerAndFYViaApi({
        budget: { allocated: 100, allowableEncumbrance: 110 },
      });

      testData.fiscalYear = fiscalYear;
      testData.fund = fund;

      Organizations.createOrganizationViaApi(testData.organization).then(() => {
        testData.order = NewOrder.getDefaultOrder({ vendorId: testData.organization.id });
        testData.orderLine = BasicOrderLine.getDefaultOrderLine({
          listUnitPrice: 110,
          fundDistribution: [{ code: testData.fund.code, fundId: testData.fund.id, value: 100 }],
        });

        Orders.createOrderWithOrderLineViaApi(testData.order, testData.orderLine).then((order) => {
          testData.order = order;

          OrderLines.getOrderLineViaApi({ query: `poLineNumber=="*${order.poNumber}*"` }).then(
            (orderLines) => {
              testData.orderLine = orderLines[0];

              Invoices.createInvoiceWithInvoiceLineViaApi({
                vendorId: testData.organization.id,
                fiscalYearId: testData.fiscalYear.id,
                poLineId: testData.orderLine.id,
                fundDistributions: testData.orderLine.fundDistribution,
                accountingCode: testData.organization.erpCode,
              }).then((invoice) => {
                testData.invoice = invoice;

                Invoices.changeInvoiceStatusViaApi({
                  invoice: testData.invoice,
                  status: INVOICE_STATUSES.APPROVED,
                });
              });
            },
          );
        });
      });
    });

    cy.createTempUser([Permissions.uiInvoicesCanViewAndEditInvoicesAndInvoiceLines.gui]).then(
      (userProperties) => {
        testData.user = userProperties;

        cy.login(testData.user.username, testData.user.password, {
          path: TopMenu.invoicesPath,
          waiter: Invoices.waitLoading,
        });
      },
    );
  });

  after('Delete test data', () => {
    cy.getAdminToken().then(() => {
      FileManager.deleteFile(`cypress/fixtures/${testData.fileName}`);
      Organizations.deleteOrganizationViaApi(testData.organization.id);
      Users.deleteViaApi(testData.user.userId);
    });
  });

  it(
    'C360544 Attaching file to approved invoice (thunderjet) (TaaS)',
    { tags: ['extendedPath', 'thunderjet'] },
    () => {
      // Open invoice from precondition
      Invoices.selectInvoiceByNumber(testData.invoice.vendorInvoiceNo);
      InvoiceView.checkInvoiceDetails({
        invoiceInformation: [{ key: 'Status', value: INVOICE_STATUSES.APPROVED }],
      });

      // Click "Actions" button, Select "Edit" option
      const InvoiceEditForm = InvoiceView.openInvoiceEditForm();

      // Click "or choose file" button in "Links & documents" accordion, Select file to attach
      InvoiceEditForm.uploadFile(testData.fileName);

      // Click "Save & close" button
      InvoiceEditForm.clickSaveButton();

      // Selected document name is displayed in "Document name" table when expand "Links & documents" accordion
      InvoiceView.checkDocumentsSection({ fileName: testData.fileName });
    },
  );
});
