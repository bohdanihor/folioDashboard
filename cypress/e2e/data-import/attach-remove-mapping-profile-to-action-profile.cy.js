import TestTypes from '../../support/dictionary/testTypes';
import DevTeams from '../../support/dictionary/devTeams';
import Helper from '../../support/fragments/finance/financeHelper';
import SettingsMenu from '../../support/fragments/settingsMenu';
import FieldMappingProfiles from '../../support/fragments/data_import/mapping_profiles/fieldMappingProfiles';
import NewFieldMappingProfile from '../../support/fragments/data_import/mapping_profiles/newFieldMappingProfile';
import ActionProfiles from '../../support/fragments/data_import/action_profiles/actionProfiles';
import NewActionProfile from '../../support/fragments/data_import/action_profiles/newActionProfile';
import ActionProfileView from '../../support/fragments/data_import/action_profiles/actionProfileView';
import FieldMappingProfileView from '../../support/fragments/data_import/mapping_profiles/fieldMappingProfileView';
import ActionProfileEdit from '../../support/fragments/data_import/action_profiles/actionProfileEdit';
import ConfirmRemoval from '../../support/fragments/data_import/action_profiles/modals/confirmRemoval';

describe('ui-data-import: Attach/Remove a field mapping profile to an action profile', () => {
  // unique profile names
  const mappingProfileName = `C11115 autotest mapping profile ${Helper.getRandomBarcode()}`;
  const actionProfileName = `C11115 autotest action profile ${Helper.getRandomBarcode()}`;

  const mappingProfile = {
    name: mappingProfileName,
    typeValue: NewFieldMappingProfile.folioRecordTypeValue.instance
  };

  const actionProfile = {
    name: actionProfileName,
    typeValue : NewActionProfile.folioRecordTypeValue.instance
  };

  before(() => {
    cy.loginAsAdmin();
  });

  after(() => {
    ActionProfiles.deleteActionProfile(actionProfileName);
    FieldMappingProfiles.deleteFieldMappingProfile(mappingProfileName);
  });

  it('C11115 Attach/Remove a field mapping profile to an action profile (folijet)', { tags: [TestTypes.smoke, DevTeams.folijet] }, () => {
    cy.visit(SettingsMenu.mappingProfilePath);
    FieldMappingProfiles.openNewMappingProfileForm();
    NewFieldMappingProfile.fillSummaryInMappingProfile(mappingProfile);
    FieldMappingProfiles.saveProfile();
    FieldMappingProfiles.closeViewModeForMappingProfile(mappingProfile.name);
    FieldMappingProfiles.checkMappingProfilePresented(mappingProfile.name);

    cy.visit(SettingsMenu.actionProfilePath);
    ActionProfiles.createActionProfile(actionProfile, mappingProfile.name);
    ActionProfiles.checkActionProfilePresented(actionProfile.name);

    ActionProfileView.verifyLinkedFieldMappingProfile(mappingProfile.name);
    ActionProfileView.openFieldMappingProfileView();
    FieldMappingProfileView.verifyLinkedActionProfile(actionProfile.name);
    FieldMappingProfileView.openAssociatedActionProfile();
    ActionProfiles.verifyActionProfileOpened();

    ActionProfileView.edit();
    ActionProfileEdit.unlinkFieldMappingProfile();
    ConfirmRemoval.canselRemoveFieldMappingProfile();
    ActionProfileEdit.fieldMappingProfilePresented(mappingProfile.name);
    ActionProfileEdit.unlinkFieldMappingProfile();
    ConfirmRemoval.confirmRemovefieldMappingProfile();
    ActionProfileEdit.fieldMappingProfileAbsent();
    ActionProfileEdit.save();
    ActionProfileView.verifyLinkedFieldMappingProfileAbsent(mappingProfile.name);
  });
});
