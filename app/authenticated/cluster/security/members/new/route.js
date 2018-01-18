import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    const gs = get(this, 'globalStore');
    const cid = this.paramsFor('authenticated.cluster');

    return hash({
      users: gs.findAll('user').then(users => users.filter(u => !u.hasOwnProperty('me'))),
      cluster: gs.find('cluster', cid.cluster_id, {forceReload: true}),
      roles: gs.find('roleTemplate', null, {filter: {hidden: false, context: 'cluster'}}),
    });
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.setProperties({
      primaryResource: get(this, 'globalStore').createRecord({
        type: 'clusterRoleTemplateBinding',
        clusterId: get(model, 'cluster.id'),
      }),
    })
  },
});
