import Controller from '@ember/controller';
import AuthMixin from 'global-admin/mixins/authentication';
import Saml from 'global-admin/mixins/saml-auth';

export default Controller.extend(AuthMixin, Saml, {
  createLabel:      'authPage.okta.buttonText.pre',
  saveLabel:        'authPage.okta.buttonText.post',
  providerName:     'okta',
  providerNamePath: 'authPage.saml.providerName.okta',

});
