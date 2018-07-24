import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get, set } from '@ember/object';

export default Component.extend({
  saml:   service(),
  errors: null,

  actions: {
    authenticate() {
      get(this, 'saml').login().catch( ( err ) => {
        set(this, 'errors', [err.message])
      });
    }
  }
});
