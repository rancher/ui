import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  scope: service(),

  model() {
    const clusterStore = this.get('clusterStore');
    const globalStore = this.get('globalStore');

    return hash({
      namespaces: clusterStore.findAll('namespace', {url: 'namespaces'}), // @TODO-2.0 get schema for cluster ns so the url isn't hardcoded
      projects: globalStore.findAll('project'),
    })
  },
});
