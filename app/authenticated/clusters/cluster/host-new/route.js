import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';

export default Route.extend({
  access:        service(),
  scope:         service('scope'),
  settings:      service(),
  host:          service(),
  backTo:        null,

  defaultDriver: '',
  lastDriver:    null,

  queryParams: {
    driver: {
      refreshModel: true,
      replace: true
    },
    hostId: {
      refreshModel: false,
    }
  },

  actions: {
    cancel() {
      this.send('goBack');
    },

    goBack() {
      let backTo = this.get('backTo');
      if ( backTo === 'hosts' ) {
        this.transitionTo('hosts.index', this.get('scope.current.id'));
      } else if ( backTo === 'clusters' ) {
        this.transitionTo('authenticated.clusters');
      } else {
        this.send('goToPrevious','authenticated.clusters');
      }
    }
  },

  activate() {
    let appRoute = getOwner(this).lookup('route:application');
    this.set('previousOpts', {name: appRoute.get('previousRoute'), params: appRoute.get('previousParams')});
  },

  resetController(controller, isExisting /*, transition*/) {
    if ( isExisting )
    {
      controller.set('hostId', null);
      controller.set('backTo', null);
    }
  },

  machineDrivers: null,

  // Loads all the machine drivers and selects the active ones with a corresponding schema into machineDrivers
  beforeModel(/*transition*/) {
    this._super(...arguments);

    var hs = this.get('host');

    return hs.loadAllDrivers().then((drivers) => {
      this.set('machineDrivers', drivers);
    });
  },

  model(params) {
    this.set('backTo', (params.backTo || 'hosts'));
    var hs = this.get('host');

    return hs.getModel(params);
  },
});
