export default {
  // direct paths to folio apps to use in cy.visit() into initial steps of our scenarios
  // TODO: add separated scenarios related with SettingsMenu implementation
  acquisitionUnitsPath: 'settings/acquisition-units',
  agreementsPath: 'settings/erm',
  calendarPath: 'settings/calendar',
  calendarLibraryHoursPath: 'settings/calendar/library-hours',
  // Circulation
  circulationRulesPath: 'settings/circulation/rules',
  circulationOtherSettingsPath: 'settings/circulation/checkout',
  circulationStaffSlipsPath: 'settings/circulation/staffslips',
  circulationFixedDueDateSchedulesPath: 'settings/circulation/fixed-due-date-schedules',
  circulationLoanHistoryPath: 'settings/circulation/loan-anonymization',
  circulationLoanPoliciesPath: 'settings/circulation/loan-policies',
  circulationoVerdueFinePoliciesPath: 'settings/circulation/fine-policies',
  circulationLostItemFeePolicyPath: 'settings/circulation/lost-item-fee-policy',
  circulationPatronNoticePoliciesPath: 'settings/circulation/notice-policies',
  circulationPatronNoticeTemplatesPath: 'settings/circulation/patron-notices',
  circulationRequestCancellationReasonsPath: 'settings/circulation/cancellation-reasons',
  circulationRequestPoliciesPath: 'settings/circulation/request-policies',
  circulationTitleLevelRequestsPath: 'settings/circulation/title-level-requests',
  coursesPath: 'settings/cr',
  dashboardPath: 'settings/dashboard',
  dataExportPath: 'settings/data-export',
  dataImportSettingsPath: 'settings/data-import',
  developerPath: 'settings/developer',
  eHoldingsPath: 'settings/eholdings',
  ermComparisonsPath: 'settings/comparisons-erm',
  innReachPath: 'settings/innreach',
  // Finance
  fundTypesPath: 'settings/finance/fund-types',
  expenseClassesPath: 'settings/finance/expense-classes',
  exportFundPath: 'settings/finance/export-fund',
  // Inventory
  inventoryPath: 'settings/inventory',
  materialTypePath: '/settings/inventory/materialtypes',
  targetProfilesPath: 'settings/inventory/targetProfiles',
  // Invoice
  invoiceApprovalsPath: 'settings/invoice/approvals',
  invoiceAdjustmentsPath: 'settings/invoice/adjustments',
  invoiceBatchGroupsPath: 'settings/invoice/batch-groups',
  invoiceBGConfigPath: 'settings/invoice/batch-group-configuration',
  invoiceVoucherPath: 'settings/invoice/voucher-number',

  ldpPath: 'settings/ldp',
  licensesPath: 'settings/licenses',
  localKbAdminPath: 'settings/local-kb-admin',
  myProfilePath: 'settings/myprofile',
  notesPath: 'settings/notes',
  oaiPmhPath: 'settings/oai-pmh',
  openAccessPath: 'settings/oa',
  ordersPath: 'settings/orders',
  organizationsPath: 'settings/organizations',
  remoteStoragePath: 'settings/remote-storage',
  tagsPath: 'settings/tags',
  tenantPath: 'settings/tenant-settings',
  tenantLocationsPath: 'settings/tenant-settings/location-locations',
  // Orders
  ordersPONumberEditPath: 'settings/orders/po-number',
  ordersOpeningPurchaseOrdersPath: 'settings/orders/open-order',
  // Users
  usersOwnersPath: 'settings/users/owners',
  usersPath: 'settings/users',
  paymentsPath: 'settings/users/payments',
  conditionsPath: 'settings/users/conditions',
  limitsPath: 'settings/users/limits',
  waiveReasons: 'settings/users/waivereasons',
  patronBlockTemplates: 'settings/users/manual-block-templates',
  // Data Import
  mappingProfilePath: 'settings/data-import/mapping-profiles',
  actionProfilePath: 'settings/data-import/action-profiles',
  matchProfilePath: 'settings/data-import/match-profiles',
  jobProfilePath: 'settings/data-import/job-profiles',
  marcFieldProtectionPath: 'settings/data-import/marc-field-protection',
  // Data export
  exportMappingProfilePath: 'settings/data-export/mapping-profiles',
  exportJobProfilePath: 'settings/data-export/job-profiles',
};
