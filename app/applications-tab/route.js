import Ember from 'ember';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  beforeModel() {
    this._super(...arguments);

    let project = this.get('projects.current');
    let auth = this.modelFor('authenticated');

    // Check for waiting only if cattle, because other orchestrations have system services menus that link here
    if ( !project.get('kubernetes') && !project.get('swarm') && !project.get('mesos') )
    {
      return this.get('projects').checkForWaiting(auth.get('hosts'),auth.get('machines'));
    }
  },

  model: function() {
    var store = this.get('store');
    return Ember.RSVP.all([
      store.findAllUnremoved('stack'),
      store.findAllUnremoved('service'),
      store.findAllUnremoved('serviceconsumemap'),
    ]).then((results) => {
      return Ember.Object.create({
        stacks: results[0],
        services: results[1],
        consumeMaps: results[2],
      });
    });
  },
});
