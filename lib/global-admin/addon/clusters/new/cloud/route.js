import Ember from 'ember';
import { get } from '@ember/object';
import { sort } from '@ember/object/computed';
import { hash } from 'rsvp';

export default Ember.Route.extend({
  clusterStore: service(),
  globalStore: service(),
  model: function(/* params, transition */) {
    let models = this.modelFor('clusters.new');
    let { cluster, roleTemplates: roles, policies } = models;

    return hash({
      users: get(this, 'globalStore').findAll('user'),
      user: get(this, 'globalStore').find('user', null, {forceReload: true, filter: {me:true}}),
      clusterRoleTemplateBinding: get(this, 'globalStore').findAll('clusterRoleTemplateBinding', { forceReload: true }),
    }).then((hash) => {
      return {
        cluster,
        clusterRoleTemplateBinding: hash.clusterRoleTemplateBinding,
        roles,
        policies,
        users: hash.users,
        me: hash.user.get('firstObject'),
      };
    });

  },

  sortBy:        ['name'],
  sortedDrivers: sort('model.availableDrivers','sortBy'),
});
