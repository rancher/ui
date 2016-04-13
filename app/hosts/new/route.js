import Ember from 'ember';
import C from 'ui/utils/constants';
import DriverChoices from 'ui/utils/driver-choices';
const { getOwner } = Ember;

export default Ember.Route.extend({
  access: Ember.inject.service(),
  settings: Ember.inject.service(),

  queryParams: {
    driver: {
      refreshModel: true
    }
  },

  backTo: null,

  beforeModel(/*transition*/) {
    return this.get('userStore').findAll('machinedriver',  {authAsUser: true}).then((drivers) => {
      let systemDrivers = DriverChoices.drivers;

      drivers.forEach((driver) => {
        if (driver.uiUrl) {
          if (!systemDrivers.findBy('name', driver.name)) {

            // script should append its own css
            Ember.$(`<script src="${driver.uiUrl}"></script>`).appendTo('BODY');

            DriverChoices.drivers.push({
              name  : driver.name, //driver.name
              label : driver.name.capitalize(),
              css   : driver.name,
              sort  : 3
            });
          }
        }
      });
    });

  },

  model(params) {
    this.set('backTo', params.backTo);

    if (params.driver) {
      this.controllerFor('hosts/new').set('lastRoute',`${params.driver}`);
    }

    if ( this.get('access.admin') ) {
      let settings = this.get('settings');
      return settings.load(C.SETTING.API_HOST).then(() => {
        let controller = this.controllerFor('hosts.new');
        if ( settings.get(C.SETTING.API_HOST) ) {
          controller.set('apiHostSet', true);
        } else {
          controller.setProperties({
            apiHostSet: false,
            hostModel: settings.get(C.SETTING.API_HOST)
          });
        }
        return Ember.RSVP.resolve();
      });
    }
  },

  activate() {
    let appRoute = getOwner(this).lookup('route:application');
    this.set('previousOpts', {name: appRoute.get('previousRoute'), params: appRoute.get('previousParams')});
  },

  deactivate() {
    this.set('lastRoute', this.get('something'));
  },

  actions: {
    cancel() {
      this.send('goBack');
    },

    savedHost() {
      this.controllerFor('hosts.new').set('apiHostSet', true);
      this.refresh();
    },

    goBack() {
      if ( this.get('backTo') === 'k8s' ) {
        this.transitionTo('k8s-tab.waiting');
      } else if ( this.get('backTo') === 'swarm' ) {
        this.transitionTo('applications-tab.compose-waiting');
      } else {
        let appRoute = getOwner(this).lookup('route:application');
        let opts = this.get('previousOpts');
        appRoute.set('previousRoute', opts.name);
        appRoute.set('previousParams', opts.params);
        this.send('goToPrevious','hosts');
      }
    }
  },
});
