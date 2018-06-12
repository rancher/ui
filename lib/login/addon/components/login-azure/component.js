import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get } from '@ember/object';

export default Component.extend({
  azureAd: service(),

  actions: {
    authenticate() {
      get(this, 'azureAd').login();
    }
  }
});
