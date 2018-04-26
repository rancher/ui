import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  clusterStore: service(),

  model() {
    var store = this.get('clusterStore');
    return hash({
      namespaces: store.findAll('namespace'),
    });
  },
});
