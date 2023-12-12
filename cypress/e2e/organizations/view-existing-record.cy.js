import NewOrganization from '../../support/fragments/organizations/newOrganization';
import Organizations from '../../support/fragments/organizations/organizations';
import TopMenu from '../../support/fragments/topMenu';

describe('ui-organizations: View organization', () => {
  const organization = { ...NewOrganization.defaultUiOrganizations };

  before(() => {
    cy.loginAsAdmin();
    cy.getAdminToken();
    Organizations.createOrganizationViaApi(organization).then((response) => {
      organization.id = response;
    });
    cy.visit(TopMenu.organizationsPath);
  });

  after(() => {
    cy.getAdminToken();
    Organizations.deleteOrganizationViaApi(organization.id);
  });

  it(
    'C672 View existing organization record (thunderjet)',
    { tags: ['smoke', 'thunderjet'] },
    () => {
      Organizations.selectActiveStatus();
      Organizations.checkOrganizationFilter();
      Organizations.selectOrganization(organization.name);
      Organizations.checkOrganizationInfo(organization);
    },
  );
});
