import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  beforeModel() {
    return this.get('userStore').findAll('machineDriver').then((drivers) => {
      let activeDrivers = drivers.filter((driver) => {
        if (C.ACTIVEISH_STATES.indexOf(driver.get('state')) >= 0) {
          return true;
        }
        return false;
      });

      if (activeDrivers.get('length')) {
        return Ember.RSVP.resolve();
      } else {
        this.transitionTo('authenticated.clusters.cluster.host-new', this.get('projects.currentCluster.id'), {queryParams: {driver: 'custom'}});
      }
    });
  },

  model(/*params,transition*/) {
    return this.get('store').findAll('hostTemplate').then((templates) => {
      if ( templates.get('length') ) {
        return templates;
      } else {
        this.transitionTo('authenticated.clusters.cluster.host-new', this.get('projects.currentCluster.id'));
      }
    });
  }
});
