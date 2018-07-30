import Controller from '@ember/controller';
import AuthMixin from 'global-admin/mixins/authentication';
import Saml from 'global-admin/mixins/saml-auth';

export default Controller.extend(AuthMixin, Saml, {
  createLabel:      'authPage.adfs.buttonText.pre',
  saveLabel:        'authPage.adfs.buttonText.post',
  providerName:     'adfs',
  providerNamePath: 'authPage.saml.providerName.adfs',

});
