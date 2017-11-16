import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  clusterStore: service('cluster-store'),
  k8s: service(),

  model() {
    return hash({
      stacks: this.get('clusterStore').find('stack'),
    }).then((hash) => {
      return EmberObject.create(hash);
    });
  },
});
