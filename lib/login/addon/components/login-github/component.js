import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  oauth: service(),

  actions: {
    authenticate() {
      this.get('oauth').login('github');
    }
  }
});
