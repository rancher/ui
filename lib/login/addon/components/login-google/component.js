import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  google: service(),

  actions: {
    authenticate() {
      this.get('google').login();
    }
  }
});
