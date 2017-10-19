import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  model: function() {
    return this.get('userStore').find('host', null, {filter: {clusterId: this.get('projects.currentCluster.id')}}).then((hosts) => {
      return {
        hosts: hosts,
      };
    });
  },
});
