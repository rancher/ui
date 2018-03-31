import { hash } from 'rsvp';
import { get } from '@ember/object'
import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    let cluster = this.modelFor('authenticated.cluster');

    if ( !get(cluster,'isReady') ) {
      this.transitionTo('authenticated.cluster.index');
    }

    return hash({
      namespaces: get(this, 'clusterStore').findAll('namespace'),
      projects: get(this, 'globalStore').findAll('project'),
    });
  },
});
