import { hash } from 'rsvp';
import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {
    const store   = get(this, 'globalStore');
    const cm      = this.modelFor('clusters.detail').clone();
    let creatorId = get(cm, 'creatorId');

    return hash({
      cluster:  cm,
      roles:    store.findAll('roleTemplate'),
      users:    store.findAll('user'),
    }).then((hash) => {
      return {
        cluster: hash.cluster,
        roles:   hash.roles,
        users:   hash.users,
        me:      hash.users.findBy('id', creatorId)||hash.users.findBy('username', creatorId), //TODO 2.0 must do because first clusters and projects are given admin as the creator id which is not the admins userid
      }
    });
  },

  resetController: function (controller, isExisting) {
    if (isExisting)
    {
      controller.set('errors', []);
    }
  },
});
