import Controller from '@ember/controller';
import AuthMixin from 'global-admin/mixins/authentication';
import Saml from 'global-admin/mixins/saml-auth';

export default Controller.extend(AuthMixin, Saml, {
  createLabel:      'authPage.ping.buttonText.pre',
  saveLabel:        'authPage.ping.buttonText.post',
  providerName:     'ping',
  providerNamePath: 'authPage.saml.providerName.ping',

});
