import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  // need to get all roles, we should have two roles and custom like the global perms
  // cluster owner, cluster-member, custom
  model() {
    const gs = get(this, 'globalStore');
    const cid = this.paramsFor('authenticated.cluster');

    return hash({
      users: gs.findAll('user'),
      cluster: gs.find('cluster', cid.cluster_id, {forceReload: true}),
      roles: gs.findAll('roleTemplate'),
    });
  },
  setupController(controller, model) {
    this._super(controller, model);
    let dfu = get(model, 'users.firstObject');
    controller.setProperties({
      defaultUser: dfu,
    })
  },
});
