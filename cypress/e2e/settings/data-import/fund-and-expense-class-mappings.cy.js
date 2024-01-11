import {
  ACQUISITION_METHOD_NAMES,
  FOLIO_RECORD_TYPE,
  JOB_STATUS_NAMES,
  ORDER_FORMAT_NAMES_IN_PROFILE,
  ORDER_STATUSES,
  VENDOR_NAMES,
  RECORD_STATUSES,
} from '../../../support/constants';
import {
  JobProfiles as SettingsJobProfiles,
  ActionProfiles as SettingsActionProfiles,
  FieldMappingProfiles as SettingsFieldMappingProfiles,
} from '../../../support/fragments/settings/dataImport';
import { Permissions } from '../../../support/dictionary';
import ActionProfiles from '../../../support/fragments/data_import/action_profiles/actionProfiles';
import DataImport from '../../../support/fragments/data_import/dataImport';
import JobProfiles from '../../../support/fragments/data_import/job_profiles/jobProfiles';
import NewJobProfile from '../../../support/fragments/data_import/job_profiles/newJobProfile';
import FileDetails from '../../../support/fragments/data_import/logs/fileDetails';
import Logs from '../../../support/fragments/data_import/logs/logs';
import FieldMappingProfileEdit from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfileEdit';
import FieldMappingProfileView from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfileView';
import FieldMappingProfiles from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfiles';
import OrderLines from '../../../support/fragments/orders/orderLines';
import Orders from '../../../support/fragments/orders/orders';
import SettingsMenu from '../../../support/fragments/settingsMenu';
import TopMenu from '../../../support/fragments/topMenu';
import Users from '../../../support/fragments/users/users';
import getRandomPostfix from '../../../support/utils/stringTools';

describe('data-import', () => {
  describe('Settings', () => {
    let user;
    const orderNumbers = [];
    const filePathForCreateOrder = 'marcFileForC376975.mrc';
    const firstMarcFileName = `C376975 autotestFileName ${getRandomPostfix()}`;
    const secondMarcFileName = `C376975 autotestFileName ${getRandomPostfix()}`;
    const thirdMarcFileName = `C376975 autotestFileName ${getRandomPostfix()}`;
    const forthMarcFileName = `C376975 autotestFileName ${getRandomPostfix()}`;
    const fundAndExpenseClassData = [
      {
        fund: 'History(HIST)',
        expenseClass: RECORD_STATUSES.DASH,
        value: '100%',
        amount: '$19.95',
      },
      {
        fund: 'African History(AFRICAHIST)',
        expenseClass: 'Electronic',
        value: '100%',
        amount: '$19.95',
      },
    ];
    const dataForChangeFundAndExpenseClass = [
      {
        fundId: '981$b',
        expenseClass: '"Electronic (Elec)"',
        value: '100',
      },
      {
        fundId: '982$b; else "History (HIST)"',
        expenseClass: '982$c',
        value: '100',
      },
      {
        fundId: '"African History (AFRICAHIST)"',
        expenseClass: '982$c; else "Electronic (Elec)"',
        value: '100',
      },
    ];
    const mappingProfile = {
      name: `C376975 Check fund & expense class mappings in Orders ${getRandomPostfix()}`,
      typeValue: FOLIO_RECORD_TYPE.ORDER,
      orderStatus: ORDER_STATUSES.PENDING,
      approved: true,
      vendor: VENDOR_NAMES.GOBI,
      title: '245$a',
      publicationDate: '264$c; else 260$c',
      publisher: '264$b; else 260$b',
      internalNote: '981$d',
      acquisitionMethod: ACQUISITION_METHOD_NAMES.PURCHASE_AT_VENDOR_SYSTEM,
      orderFormat: ORDER_FORMAT_NAMES_IN_PROFILE.PHYSICAL_RESOURCE,
      selector: '981$e',
      receivingWorkflow: 'Synchronized',
      physicalUnitPrice: '980$b',
      quantityPhysical: '980$g',
      currency: 'USD',
      createInventory: 'None',
      contributor: '100$a',
      contributorType: 'Personal name',
      productId: '028$a " " 028$b',
      productIDType: 'Publisher or distributor number',
      vendorReferenceNumber: '980$f',
      vendorReferenceType: 'Vendor order reference number',
      fundId: '981$b',
      expenseClass: '981$c',
      value: '100',
      type: '%',
    };
    const actionProfile = {
      typeValue: FOLIO_RECORD_TYPE.ORDER,
      name: `C376975 Check fund & expense class mappings in Orders ${getRandomPostfix()}`,
    };
    const jobProfile = {
      ...NewJobProfile.defaultJobProfile,
      profileName: `C376975 Check fund & expense class mappings in Orders ${getRandomPostfix()}`,
    };

    before('login', () => {
      cy.createTempUser([
        Permissions.settingsDataImportEnabled.gui,
        Permissions.moduleDataImportEnabled.gui,
        Permissions.inventoryAll.gui,
        Permissions.uiOrdersApprovePurchaseOrders.gui,
        Permissions.uiOrdersCreate.gui,
        Permissions.uiOrganizationsView.gui,
      ]).then((userProperties) => {
        user = userProperties;
        cy.login(userProperties.username, userProperties.password, {
          path: SettingsMenu.mappingProfilePath,
          waiter: FieldMappingProfiles.waitLoading,
        });
      });
    });

    after('delete test data', () => {
      cy.getAdminToken().then(() => {
        Users.deleteViaApi(user.userId);
        SettingsJobProfiles.deleteJobProfileByNameViaApi(jobProfile.profileName);
        SettingsActionProfiles.deleteActionProfileByNameViaApi(actionProfile.name);
        SettingsFieldMappingProfiles.deleteMappingProfileByNameViaApi(mappingProfile.name);
        cy.wrap(orderNumbers).each((number) => {
          Orders.getOrdersApi({ limit: 1, query: `"poNumber"=="${number}"` }).then((orderId) => {
            Orders.deleteOrderViaApi(orderId[0].id);
          });
        });
      });
    });

    it(
      'C376975 Order field mapping profile: Check fund and expense class mappings (folijet)',
      { tags: ['criticalPath', 'folijet'] },
      () => {
        // create mapping profile
        FieldMappingProfiles.createOrderMappingProfile(mappingProfile);
        FieldMappingProfiles.checkMappingProfilePresented(mappingProfile.name);

        // create action profile
        cy.visit(SettingsMenu.actionProfilePath);
        ActionProfiles.create(actionProfile, mappingProfile.name);
        ActionProfiles.checkActionProfilePresented(actionProfile.name);

        // create job profile
        cy.visit(SettingsMenu.jobProfilePath);
        JobProfiles.createJobProfile(jobProfile);
        NewJobProfile.linkActionProfile(actionProfile);
        NewJobProfile.saveAndClose();
        JobProfiles.checkJobProfilePresented(jobProfile.profileName);

        cy.visit(TopMenu.dataImportPath);
        // TODO delete function after fix https://issues.folio.org/browse/MODDATAIMP-691
        DataImport.verifyUploadState();
        DataImport.uploadFile(filePathForCreateOrder, firstMarcFileName);
        JobProfiles.waitFileIsUploaded();
        JobProfiles.search(jobProfile.profileName);
        JobProfiles.runImportFile();
        Logs.waitFileIsImported(firstMarcFileName);
        Logs.checkStatusOfJobProfile(JOB_STATUS_NAMES.COMPLETED);
        Logs.openFileDetails(firstMarcFileName);
        // check Fund and Expense class populated in the first POL
        FileDetails.openOrder(RECORD_STATUSES.CREATED);
        OrderLines.waitLoading();
        OrderLines.getAssignedPOLNumber().then((initialNumber) => {
          const orderNumber = initialNumber.replace('-1', '');

          orderNumbers.push(orderNumber);
        });
        OrderLines.checkFundAndExpenseClassPopulated(fundAndExpenseClassData[0]);
        cy.go('back');
        // check Fund and Expense class populated in the second POL
        FileDetails.openOrder(RECORD_STATUSES.CREATED, 1);
        OrderLines.waitLoading();
        OrderLines.getAssignedPOLNumber().then((initialNumber) => {
          const orderNumber = initialNumber.replace('-1', '');

          orderNumbers.push(orderNumber);
        });
        OrderLines.checkFundAndExpenseClassPopulated(fundAndExpenseClassData[1]);

        cy.visit(SettingsMenu.mappingProfilePath);
        FieldMappingProfiles.search(mappingProfile.name);
        FieldMappingProfileView.edit();
        FieldMappingProfileEdit.fillFundDistriction(dataForChangeFundAndExpenseClass[0]);
        FieldMappingProfileEdit.save();

        cy.visit(TopMenu.dataImportPath);
        // TODO delete function after fix https://issues.folio.org/browse/MODDATAIMP-691
        DataImport.verifyUploadState();
        DataImport.uploadFile(filePathForCreateOrder, secondMarcFileName);
        JobProfiles.waitFileIsUploaded();
        JobProfiles.search(jobProfile.profileName);
        JobProfiles.runImportFile();
        Logs.waitFileIsImported(secondMarcFileName);
        Logs.checkStatusOfJobProfile(JOB_STATUS_NAMES.COMPLETED_WITH_ERRORS);
        Logs.openFileDetails(secondMarcFileName);
        FileDetails.checkStatusInColumn(
          RECORD_STATUSES.NO_ACTION,
          FileDetails.columnNameInResultList.order,
        );
        FileDetails.checkStatusInColumn(
          RECORD_STATUSES.CREATED,
          FileDetails.columnNameInResultList.order,
          1,
        );

        // check Fund and Expense class populated in the second POL
        FileDetails.openOrder(RECORD_STATUSES.CREATED, 1);
        OrderLines.waitLoading();
        OrderLines.getAssignedPOLNumber().then((initialNumber) => {
          const orderNumber = initialNumber.replace('-1', '');

          orderNumbers.push(orderNumber);
        });
        OrderLines.checkFundAndExpenseClassPopulated(fundAndExpenseClassData[1]);

        cy.visit(SettingsMenu.mappingProfilePath);
        FieldMappingProfiles.search(mappingProfile.name);
        FieldMappingProfileView.edit();
        FieldMappingProfileEdit.fillFundDistriction(dataForChangeFundAndExpenseClass[1]);
        FieldMappingProfileEdit.save();

        cy.visit(TopMenu.dataImportPath);
        // TODO delete function after fix https://issues.folio.org/browse/MODDATAIMP-691
        DataImport.verifyUploadState();
        DataImport.uploadFile(filePathForCreateOrder, thirdMarcFileName);
        JobProfiles.waitFileIsUploaded();
        JobProfiles.search(jobProfile.profileName);
        JobProfiles.runImportFile();
        Logs.waitFileIsImported(thirdMarcFileName);
        Logs.checkStatusOfJobProfile(JOB_STATUS_NAMES.COMPLETED);
        Logs.openFileDetails(thirdMarcFileName);
        FileDetails.checkStatusInColumn(
          RECORD_STATUSES.CREATED,
          FileDetails.columnNameInResultList.order,
        );
        FileDetails.checkStatusInColumn(
          RECORD_STATUSES.CREATED,
          FileDetails.columnNameInResultList.order,
          1,
        );
        // check Fund and Expense class populated in the first POL
        FileDetails.openOrder(RECORD_STATUSES.CREATED);
        OrderLines.waitLoading();
        OrderLines.getAssignedPOLNumber().then((initialNumber) => {
          const orderNumber = initialNumber.replace('-1', '');

          orderNumbers.push(orderNumber);
        });
        OrderLines.checkFundAndExpenseClassPopulated(fundAndExpenseClassData[0]);
        cy.go('back');
        // check Fund and Expense class populated in the second POL
        FileDetails.openOrder(RECORD_STATUSES.CREATED, 1);
        OrderLines.waitLoading();
        OrderLines.getAssignedPOLNumber().then((initialNumber) => {
          const orderNumber = initialNumber.replace('-1', '');

          orderNumbers.push(orderNumber);
        });
        OrderLines.checkFundAndExpenseClassPopulated(fundAndExpenseClassData[0]);

        cy.visit(SettingsMenu.mappingProfilePath);
        FieldMappingProfiles.search(mappingProfile.name);
        FieldMappingProfileView.edit();
        FieldMappingProfileEdit.fillFundDistriction(dataForChangeFundAndExpenseClass[2]);
        FieldMappingProfileEdit.save();

        cy.visit(TopMenu.dataImportPath);
        // TODO delete function after fix https://issues.folio.org/browse/MODDATAIMP-691
        DataImport.verifyUploadState();
        DataImport.uploadFile(filePathForCreateOrder, forthMarcFileName);
        JobProfiles.waitFileIsUploaded();
        JobProfiles.search(jobProfile.profileName);
        JobProfiles.runImportFile();
        Logs.waitFileIsImported(forthMarcFileName);
        Logs.checkStatusOfJobProfile(JOB_STATUS_NAMES.COMPLETED);
        Logs.openFileDetails(forthMarcFileName);
        FileDetails.checkStatusInColumn(
          RECORD_STATUSES.CREATED,
          FileDetails.columnNameInResultList.order,
        );
        FileDetails.checkStatusInColumn(
          RECORD_STATUSES.CREATED,
          FileDetails.columnNameInResultList.order,
          1,
        );
        // check Fund and Expense class populated in the first POL
        FileDetails.openOrder(RECORD_STATUSES.CREATED);
        OrderLines.waitLoading();
        OrderLines.getAssignedPOLNumber().then((initialNumber) => {
          const orderNumber = initialNumber.replace('-1', '');

          orderNumbers.push(orderNumber);
        });
        OrderLines.checkFundAndExpenseClassPopulated(fundAndExpenseClassData[1]);
        cy.go('back');
        // check Fund and Expense class populated in the second POL
        FileDetails.openOrder(RECORD_STATUSES.CREATED, 1);
        OrderLines.waitLoading();
        OrderLines.getAssignedPOLNumber().then((initialNumber) => {
          const orderNumber = initialNumber.replace('-1', '');

          orderNumbers.push(orderNumber);
        });
        OrderLines.checkFundAndExpenseClassPopulated(fundAndExpenseClassData[1]);
      },
    );
  });
});
