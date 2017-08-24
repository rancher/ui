import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  projects: Ember.inject.service(),

  model(/*params,transition*/) {
    return this.get('store').findAll('hostTemplate');
  },

  redirect(model) {
    if ( model.get('length') ) {
      return this.get('userStore').findAll('machineDriver').then((drivers) => {
        let activeDrivers = drivers.filter((driver) => {
          if (C.ACTIVEISH_STATES.indexOf(driver.get('state')) >= 0) {
            return true;
          }
          return false;
        });

        if (!activeDrivers.get('length')) {
          this.transitionTo('authenticated.clusters.cluster.host-new', this.get('projects.currentCluster.id'), {queryParams: {driver: 'custom'}});
        }
      });
    } else {
      this.transitionTo('authenticated.clusters.cluster.host-new', this.get('projects.currentCluster.id'));
    }
  },


  resetController(controller, isExisting /*, transition*/) {
    if ( isExisting ) {
      controller.set('backTo', 'hosts');
    }
  },
});
