import Ember from 'ember';
const { getOwner } = Ember;

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
        this.transitionTo('hosts.templates');
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
