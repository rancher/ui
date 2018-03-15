import { get } from '@ember/object'
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    let cluster = this.modelFor('authenticated.cluster');

    if ( get(cluster,'state') !== 'active' ) {
      this.transitionTo('authenticated.cluster.index');
    }

    return hash({
      storageClasses: get(this, 'clusterStore').findAll('storageClass'),
    });
  },
});
