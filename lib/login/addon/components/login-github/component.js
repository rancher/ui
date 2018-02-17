import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  github: service(),

  actions: {
    authenticate() {
      this.sendAction('action');
      later(() => {
        // this.get('github').authorizeRedirect();
        this.get('github').login();
      }, 10);
    }
  }
});
