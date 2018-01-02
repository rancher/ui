import { hash } from 'rsvp';
import { get } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model(params) {
    const store = get(this, 'globalStore');
    return hash({
      project:  store.find('project', params.project_id),
      projects: store.findAll('project'),
      roles:    store.findAll('roleTemplate'),
      policies: store.find('podSecurityPolicyTemplate'),
      users: store.find('user', null, {forceReload: true}),
      me: store.find('user', null, {filter: {me: true}}).then(users => get(users, 'firstObject'))
    });
  },
});
