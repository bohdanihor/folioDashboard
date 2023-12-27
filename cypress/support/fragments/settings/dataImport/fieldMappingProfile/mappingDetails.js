export default {
  MARC_AUTHORITY: {
    name: 'marcAuthority',
    recordType: 'MARC_AUTHORITY',
    marcMappingOption: 'UPDATE',
    mappingFields: [
      {
        name: 'discoverySuppress',
        enabled: true,
        path: 'marcAuthority.discoverySuppress',
        value: null,
        booleanFieldAction: 'IGNORE',
        subfields: [],
      },
      {
        name: 'hrid',
        enabled: true,
        path: 'marcAuthority.hrid',
        value: '',
        subfields: [],
      },
    ],
  },
  ITEM: {
    name: 'item',
    recordType: 'ITEM',
    mappingFields: [
      {
        name: 'discoverySuppress',
        enabled: true,
        path: 'item.discoverySuppress',
        value: null,
        subfields: [],
      },
      { name: 'hrid', enabled: true, path: 'item.hrid', value: '', subfields: [] },
      { name: 'barcode', enabled: true, path: 'item.barcode', value: '', subfields: [] },
      {
        name: 'accessionNumber',
        enabled: true,
        path: 'item.accessionNumber',
        value: '',
        subfields: [],
      },
      {
        name: 'itemIdentifier',
        enabled: true,
        path: 'item.itemIdentifier',
        value: '',
        subfields: [],
      },
      { name: 'formerIds', enabled: true, path: 'item.formerIds[]', value: '', subfields: [] },
      {
        name: 'statisticalCodeIds',
        enabled: true,
        path: 'item.statisticalCodeIds[]',
        value: '',
        subfields: [],
      },
      {
        name: 'administrativeNotes',
        enabled: true,
        path: 'item.administrativeNotes[]',
        value: '',
        subfields: [],
      },
      {
        name: 'materialType.id',
        enabled: true,
        path: 'item.materialType.id',
        value: '',
        subfields: [],
        acceptedValues: {},
      },
      { name: 'copyNumber', enabled: true, path: 'item.copyNumber', value: '', subfields: [] },
      {
        name: 'itemLevelCallNumberTypeId',
        enabled: true,
        path: 'item.itemLevelCallNumberTypeId',
        value: '',
        subfields: [],
        acceptedValues: {},
      },
      {
        name: 'itemLevelCallNumberPrefix',
        enabled: true,
        path: 'item.itemLevelCallNumberPrefix',
        value: '',
        subfields: [],
      },
      {
        name: 'itemLevelCallNumber',
        enabled: true,
        path: 'item.itemLevelCallNumber',
        value: '',
        subfields: [],
      },
      {
        name: 'itemLevelCallNumberSuffix',
        enabled: true,
        path: 'item.itemLevelCallNumberSuffix',
        value: '',
        subfields: [],
      },
      {
        name: 'numberOfPieces',
        enabled: true,
        path: 'item.numberOfPieces',
        value: '',
        subfields: [],
      },
      {
        name: 'descriptionOfPieces',
        enabled: true,
        path: 'item.descriptionOfPieces',
        value: '',
        subfields: [],
      },
      { name: 'enumeration', enabled: true, path: 'item.enumeration', value: '', subfields: [] },
      { name: 'chronology', enabled: true, path: 'item.chronology', value: '', subfields: [] },
      { name: 'volume', enabled: true, path: 'item.volume', value: '', subfields: [] },
      {
        name: 'yearCaption',
        enabled: true,
        path: 'item.yearCaption[]',
        value: '',
        subfields: [],
      },
      {
        name: 'numberOfMissingPieces',
        enabled: true,
        path: 'item.numberOfMissingPieces',
        value: '',
        subfields: [],
      },
      {
        name: 'missingPieces',
        enabled: true,
        path: 'item.missingPieces',
        value: '',
        subfields: [],
      },
      {
        name: 'missingPiecesDate',
        enabled: true,
        path: 'item.missingPiecesDate',
        value: '',
        subfields: [],
      },
      {
        name: 'itemDamagedStatusId',
        enabled: true,
        path: 'item.itemDamagedStatusId',
        value: '',
        subfields: [],
        acceptedValues: {},
      },
      {
        name: 'itemDamagedStatusDate',
        enabled: true,
        path: 'item.itemDamagedStatusDate',
        value: '',
        subfields: [],
      },
      { name: 'notes', enabled: true, path: 'item.notes[]', value: '', subfields: [] },
      {
        name: 'permanentLoanType.id',
        enabled: true,
        path: 'item.permanentLoanType.id',
        value: '',
        subfields: [],
        acceptedValues: {},
      },
      {
        name: 'temporaryLoanType.id',
        enabled: true,
        path: 'item.temporaryLoanType.id',
        value: '',
        subfields: [],
        acceptedValues: {},
      },
      { name: 'status.name', enabled: true, path: 'item.status.name', value: '', subfields: [] },
      {
        name: 'circulationNotes',
        enabled: true,
        path: 'item.circulationNotes[]',
        value: '',
        subfields: [],
      },
      {
        name: 'permanentLocation.id',
        enabled: true,
        path: 'item.permanentLocation.id',
        value: '',
        subfields: [],
        acceptedValues: {},
      },
      {
        name: 'temporaryLocation.id',
        enabled: true,
        path: 'item.temporaryLocation.id',
        value: '',
        subfields: [],
        acceptedValues: {},
      },
      {
        name: 'electronicAccess',
        enabled: true,
        path: 'item.electronicAccess[]',
        value: '',
        subfields: [],
      },
    ],
  },
  HOLDINGS: {
    name: 'holdings',
    recordType: 'HOLDINGS',
    mappingFields: [
      {
        name: 'discoverySuppress',
        enabled: true,
        path: 'holdings.discoverySuppress',
        value: '',
        subfields: [],
      },
      {
        name: 'hrid',
        enabled: false,
        path: 'holdings.discoverySuppress',
        value: '',
        subfields: [],
      },
      {
        name: 'formerIds',
        enabled: true,
        path: 'holdings.formerIds[]',
        value: '',
        subfields: [],
      },
      {
        name: 'holdingsTypeId',
        enabled: true,
        path: 'holdings.holdingsTypeId',
        value: '',
        subfields: [],
      },
      {
        name: 'statisticalCodeIds',
        enabled: true,
        path: 'holdings.statisticalCodeIds[]',
        value: '',
        subfields: [],
      },
      {
        name: 'administrativeNotes',
        enabled: true,
        path: 'holdings.administrativeNotes[]',
        value: '',
        subfields: [],
      },
      {
        name: 'shelvingOrder',
        enabled: true,
        path: 'holdings.shelvingOrder',
        value: '',
        subfields: [],
      },
      {
        name: 'shelvingTitle',
        enabled: true,
        path: 'holdings.shelvingTitle',
        value: '',
        subfields: [],
      },
      {
        name: 'copyNumber',
        enabled: true,
        path: 'holdings.copyNumber',
        value: '',
        subfields: [],
      },
      {
        name: 'callNumberTypeId',
        enabled: true,
        path: 'holdings.callNumberTypeId',
        value: '',
        subfields: [],
      },
      {
        name: 'callNumberPrefix',
        enabled: true,
        path: 'holdings.callNumberPrefix',
        value: '',
        subfields: [],
      },
      {
        name: 'callNumber',
        enabled: true,
        path: 'holdings.callNumber',
        value: '',
        subfields: [],
      },
      {
        name: 'callNumberSuffix',
        enabled: true,
        path: 'holdings.callNumberSuffix',
        value: '',
        subfields: [],
      },
      {
        name: 'numberOfItems',
        enabled: true,
        path: 'holdings.numberOfItems',
        value: '',
        subfields: [],
      },
      {
        name: 'holdingsStatements',
        enabled: true,
        path: 'holdings.holdingsStatements[]',
        value: '',
        subfields: [],
      },
      {
        name: 'holdingsStatementsForSupplements',
        enabled: true,
        path: 'holdings.holdingsStatementsForSupplements[]',
        value: '',
        subfields: [],
      },
      {
        name: 'holdingsStatementsForIndexes',
        enabled: true,
        path: 'holdings.holdingsStatementsForIndexes[]',
        value: '',
        subfields: [],
      },
      {
        name: 'illPolicyId',
        enabled: true,
        path: 'holdings.illPolicyId',
        value: '',
        subfields: [],
      },
      {
        name: 'digitizationPolicy',
        enabled: true,
        path: 'holdings.digitizationPolicy',
        value: '',
        subfields: [],
      },
      {
        name: 'retentionPolicy',
        enabled: true,
        path: 'holdings.retentionPolicy',
        value: '',
        subfields: [],
      },
      {
        name: 'notes',
        enabled: true,
        path: 'holdings.notes[]',
        value: '',
        subfields: [],
      },
      {
        name: 'electronicAccess',
        enabled: true,
        path: 'holdings.electronicAccess[]',
        value: '',
        subfields: [],
      },
      {
        name: 'receivingHistory.entries',
        enabled: true,
        path: 'holdings.receivingHistory.entries[]',
        value: '',
        subfields: [],
      },
    ],
  },
  INVOICE: {
    name: 'invoice',
    recordType: 'INVOICE',
    mappingFields: [
      {
        name: 'batchGroupId',
        enabled: true,
        path: 'invoice.batchGroupId',
        subfields: [],
        value: '""',
      },
      {
        name: 'vendorId',
        enabled: true,
        path: 'invoice.vendorId',
        value: '""',
        subfields: [],
      },
      {
        name: 'invoiceDate',
        enabled: true,
        path: 'invoice.invoiceDate',
        value: '###TODAY###',
        subfields: [],
      },
      {
        name: 'status',
        enabled: true,
        path: 'invoice.status',
        value: '"Open"',
        subfields: [],
      },
      {
        name: 'paymentDue',
        enabled: true,
        path: 'invoice.paymentDue',
        value: '',
        subfields: [],
      },
      {
        name: 'paymentTerms',
        enabled: true,
        path: 'invoice.paymentTerms',
        value: '',
        subfields: [],
      },
      {
        name: 'approvalDate',
        enabled: false,
        path: 'invoice.approvalDate',
        value: '',
        subfields: [],
      },
      {
        name: 'approvedBy',
        enabled: false,
        path: 'invoice.approvedBy',
        value: '',
        subfields: [],
      },
      {
        name: 'acqUnitIds',
        enabled: true,
        path: 'invoice.acqUnitIds[]',
        repeatableFieldAction: 'EXTEND_EXISTING',
        value: '',
        subfields: [
          {
            order: 0,
            path: 'invoice.acqUnitIds[]',
            fields: [
              {
                name: 'acqUnitIds',
                enabled: true,
                path: 'invoice.acqUnitIds[]',
                value: '',
              },
            ],
          },
        ],
      },
      {
        name: 'billTo',
        enabled: true,
        path: 'invoice.billTo',
        value: '',
        acceptedValues: {},
        subfields: [],
      },
      {
        name: 'billToAddress',
        enabled: false,
        path: 'invoice.billToAddress',
        value: '',
        subfields: [],
      },
      {
        name: 'subTotal',
        enabled: false,
        path: 'invoice.subTotal',
        value: '',
        subfields: [],
      },
      {
        name: 'adjustmentsTotal',
        enabled: false,
        path: 'invoice.adjustmentsTotal',
        value: '',
        subfields: [],
      },
      {
        name: 'total',
        enabled: false,
        path: 'invoice.total',
        value: '',
        subfields: [],
      },
      {
        name: 'lockTotal',
        enabled: true,
        path: 'invoice.lockTotal',
        value: '',
        subfields: [],
      },
      { name: 'note', enabled: true, path: 'invoice.note', value: '', subfields: [] },
      {
        name: 'adjustments',
        enabled: true,
        path: 'invoice.adjustments[]',
        repeatableFieldAction: null,
        value: '',
        subfields: [],
      },
      {
        name: 'vendorInvoiceNo',
        enabled: true,
        path: 'invoice.vendorInvoiceNo',
        subfields: [],
        value: '1234',
      },
      {
        name: 'accountingCode',
        enabled: true,
        path: 'invoice.accountingCode',
        value: '"ERP-557.9514681950425535"',
        subfields: [],
      },
      {
        name: 'folioInvoiceNo',
        enabled: false,
        path: 'invoice.folioInvoiceNo',
        value: '',
        subfields: [],
      },
      {
        name: 'paymentMethod',
        enabled: true,
        path: 'invoice.paymentMethod',
        value: '"Cash"',
        subfields: [],
      },
      {
        name: 'chkSubscriptionOverlap',
        enabled: true,
        path: 'invoice.chkSubscriptionOverlap',
        value: null,
        booleanFieldAction: 'ALL_FALSE',
        subfields: [],
      },
      {
        name: 'exportToAccounting',
        enabled: true,
        path: 'invoice.exportToAccounting',
        value: null,
        booleanFieldAction: 'ALL_FALSE',
        subfields: [],
      },
      {
        name: 'currency',
        enabled: true,
        path: 'invoice.currency',
        subfields: [],
        value: '"USD"',
      },
      {
        name: 'currentExchangeRate',
        enabled: false,
        path: 'invoice.currentExchangeRate',
        value: '',
        subfields: [],
      },
      {
        name: 'exchangeRate',
        enabled: true,
        path: 'invoice.exchangeRate',
        value: '',
        subfields: [],
      },
      {
        name: 'invoiceLines',
        enabled: true,
        path: 'invoice.invoiceLines[]',
        repeatableFieldAction: 'EXTEND_EXISTING',
        value: '',
        subfields: [
          {
            order: 0,
            path: 'invoice.invoiceLines[]',
            fields: [
              {
                name: 'description',
                enabled: true,
                path: 'invoice.invoiceLines[].description',
                value: 'description',
              },
              {
                name: 'poLineId',
                enabled: true,
                path: 'invoice.invoiceLines[].poLineId',
                value: '',
              },
              {
                name: 'invoiceLineNumber',
                enabled: false,
                path: 'invoice.invoiceLines[].invoiceLineNumber',
                value: '',
              },
              {
                name: 'invoiceLineStatus',
                enabled: false,
                path: 'invoice.invoiceLines[].invoiceLineStatus',
                value: '',
              },
              {
                name: 'referenceNumbers',
                enabled: true,
                path: 'invoice.invoiceLines[].referenceNumbers[]',
                repeatableFieldAction: null,
                value: '',
                subfields: [],
              },
              {
                name: 'subscriptionInfo',
                enabled: true,
                path: 'invoice.invoiceLines[].subscriptionInfo',
                value: '',
              },
              {
                name: 'subscriptionStart',
                enabled: true,
                path: 'invoice.invoiceLines[].subscriptionStart',
                value: '',
              },
              {
                name: 'subscriptionEnd',
                enabled: true,
                path: 'invoice.invoiceLines[].subscriptionEnd',
                value: '',
              },
              {
                name: 'comment',
                enabled: true,
                path: 'invoice.invoiceLines[].comment',
                value: '',
              },
              {
                name: 'lineAccountingCode',
                enabled: false,
                path: 'invoice.invoiceLines[].accountingCode',
                value: '',
              },
              {
                name: 'accountNumber',
                enabled: true,
                path: 'invoice.invoiceLines[].accountNumber',
              },
              {
                name: 'quantity',
                enabled: true,
                path: 'invoice.invoiceLines[].quantity',
                value: '1',
              },
              {
                name: 'lineSubTotal',
                enabled: true,
                path: 'invoice.invoiceLines[].subTotal',
                value: '10',
              },
              {
                name: 'releaseEncumbrance',
                enabled: true,
                path: 'invoice.invoiceLines[].releaseEncumbrance',
                value: null,
                booleanFieldAction: 'ALL_FALSE',
              },
              {
                name: 'fundDistributions',
                enabled: true,
                path: 'invoice.invoiceLines[].fundDistributions[]',
                repeatableFieldAction: null,
                value: '',
                subfields: [],
              },
              {
                name: 'lineAdjustments',
                enabled: true,
                path: 'invoice.invoiceLines[].adjustments[]',
                repeatableFieldAction: null,
                value: '',
                subfields: [],
              },
            ],
          },
        ],
      },
    ],
  },
};
