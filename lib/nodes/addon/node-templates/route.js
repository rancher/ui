import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {
    return hash({
      nodeTemplates:   this.globalStore.findAll('nodeTemplate'),
      cloudCredential: this.globalStore.findAll('cloudcredential'),
      users:           this.globalStore.findAll('user')
    });
  },
});
