import {
  FOLIO_RECORD_TYPE,
  ORDER_STATUSES,
  VENDOR_NAMES,
  ACQUISITION_METHOD_NAMES,
  ORDER_FORMAT_NAMES_IN_PROFILE,
} from '../../../support/constants';
import { Permissions } from '../../../support/dictionary';
import { FieldMappingProfiles as SettingsFieldMappingProfiles } from '../../../support/fragments/settings/dataImport';
import FieldMappingProfileView from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfileView';
import FieldMappingProfiles from '../../../support/fragments/data_import/mapping_profiles/fieldMappingProfiles';
import NewFieldMappingProfile from '../../../support/fragments/data_import/mapping_profiles/newFieldMappingProfile';
import SettingsMenu from '../../../support/fragments/settingsMenu';
import Users from '../../../support/fragments/users/users';
import getRandomStringCode from '../../../support/utils/genereteTextCode';

describe('data-import', () => {
  describe('Settings', () => {
    let user;
    const mappingProfile = {
      name: `C380418 Info icon ${getRandomStringCode(50)}`,
      incomingRecordType: FOLIO_RECORD_TYPE.MARCBIBLIOGRAPHIC,
      typeValue: FOLIO_RECORD_TYPE.ORDER,
      orderStatus: ORDER_STATUSES.PENDING,
      vendor: VENDOR_NAMES.GOBI,
      title: '245$a',
      acquisitionMethod: ACQUISITION_METHOD_NAMES.PURCHASE_AT_VENDOR_SYSTEM,
      orderFormat: ORDER_FORMAT_NAMES_IN_PROFILE.PHYSICAL_RESOURCE,
      currency: 'USD',
      receivingWorkflow: 'Synchronized',
    };

    before('create user', () => {
      cy.createTempUser([Permissions.settingsDataImportEnabled.gui]).then((userProperties) => {
        user = userProperties;
        cy.login(user.username, user.password);
      });
    });

    after('delete test data', () => {
      cy.getAdminToken().then(() => {
        Users.deleteViaApi(user.userId);
        SettingsFieldMappingProfiles.deleteMappingProfileByNameViaApi(mappingProfile.name);
      });
    });

    it(
      'C380418 Order field mapping profile: review adjusted info icon text for Physical resource "Create inventory" field (folijet) (TaaS)',
      { tags: ['extendedPath', 'folijet'] },
      () => {
        const message =
          'Required when Order format is Physical resource, P/E mix, or Other. ' +
          'When import job creates a Pending order, this field controls the Inventory record requirements when the PO is opened via the Orders app. ' +
          'When import job creates an Open order, this field reflects the Inventory record requirements that were included as actions in the Data Import job profile';

        cy.visit(SettingsMenu.mappingProfilePath);
        FieldMappingProfiles.openNewMappingProfileForm();
        NewFieldMappingProfile.fillOrderMappingProfile(mappingProfile);
        NewFieldMappingProfile.verifyPhysicalResourceCreateInventoryInfoMessage(message);
        NewFieldMappingProfile.save();
        FieldMappingProfileView.verifyMappingProfileOpened();
        FieldMappingProfileView.edit();
        NewFieldMappingProfile.verifyPhysicalResourceCreateInventoryInfoMessage(message);
      },
    );
  });
});
