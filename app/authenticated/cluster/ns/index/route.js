import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  scope: service(),

  model() {
    const store = this.get('clusterStore');

    return hash({
      namespaces: store.findAll('namespace'),
      projects: store.findAll('project')
    })
  },
});
