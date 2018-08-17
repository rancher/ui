import Controller from '@ember/controller';
import AuthMixin from 'global-admin/mixins/authentication';
import Saml from 'global-admin/mixins/saml-auth';

export default Controller.extend(AuthMixin, Saml, {
  createLabel:      'authPage.keycloak.buttonText.pre',
  saveLabel:        'authPage.keycloak.buttonText.post',
  providerName:     'keycloak',
  providerNamePath: 'authPage.saml.providerName.keycloak',

});
