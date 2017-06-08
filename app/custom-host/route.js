import Ember from 'ember';
const { getOwner } = Ember;
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access         : Ember.inject.service(),
  projects       : Ember.inject.service(),
  settings       : Ember.inject.service(),
  host           : Ember.inject.service(),
  backTo         : null,

  actions: {
    cancel() {
      this.send('goBack');
    },

    goBack() {
      if ( this.get('backTo') === 'waiting' ) {
        this.transitionTo('authenticated.project.waiting');
      } else {

        let drivers = this.get('machineDrivers');
        let acd = drivers.filter((driver) => {
          if (C.ACTIVEISH_STATES.indexOf(driver.get('state')) >= 0) {
            return true;
          }
          return false;
        });

        if (acd.length) {
          this.transitionTo('hosts.templates');
        } else {
          this.transitionTo('hosts.index');
        }
      }
    }
  },

  activate() {
    let appRoute = getOwner(this).lookup('route:application');
    this.set('previousOpts', {name: appRoute.get('previousRoute'), params: appRoute.get('previousParams')});
  },

  // Loads all the machine drivers and selects the active ones with a corresponding schema into machineDrivers
  beforeModel(/*transition*/) {
    this._super(...arguments);

    var hs = this.get('host');

    return hs.loadAllDrivers().then((drivers) => {
      this.set('machineDrivers', drivers);
    });
  },

  model(params) {
    this.set('backTo', params.backTo);
    var hs = this.get('host');

    return hs.getModel(params).then((hash) => {
      return hash;
    });
  },

});
