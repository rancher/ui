import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),
  clusterStore:  service(),
  scope: service(),

  model() {
    return hash({
      projects: get(this, 'globalStore').findAll('project'),
      namespaces: get(this, 'clusterStore').findAll('namespace')
    });
  },
});
