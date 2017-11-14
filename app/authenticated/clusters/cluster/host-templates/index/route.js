import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  clusterStore: service('cluster-store'),
  scope:        service(),
  backTo:       null,

  model(params/*,transition*/) {
    this.set('backTo', params.backTo);
    return this.get('clusterStore').findAll('hostTemplate');
  },

  setupController(controller, model) {
    this._super(controller, model);
    let cluster = this.modelFor('authenticated.clusters.cluster');
    controller.set('currentClusterId', cluster.get('id'));
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
          this.transitionTo('authenticated.clusters.cluster.host-new', this.get('scope.currentCluster.id'), {queryParams: {
            backTo: this.get('backTo'),
            driver: 'custom'
          }});
        }
      });
    } else {
      this.transitionTo('authenticated.clusters.cluster.host-new', this.get('scope.currentCluster.id'), {queryParams: {
        backTo: this.get('backTo')
      }});
    }
  },


  resetController(controller, isExisting /*, transition*/) {
    if ( isExisting ) {
      controller.set('backTo', 'hosts');
    }
  },
});
