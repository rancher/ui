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
      return new Ember.RSVP.Promise((resolve, reject) => {
        let systemDrivers = DriverChoices.drivers;
        let completed = 0, expected = 0;
        let timer = null;

        function loaded() {
          completed++;
          if ( completed === expected ) {
            resolve();
            clearTimeout(timer);
          }
        }

        function errored() {
          clearTimeout(timer);
          reject({type: 'error', message: 'Error loading custom driver UI: ' + driver.name});
        }

        drivers.forEach((driver) => {
          var id = 'driver-ui-js-' + driver.name;
          if (driver.uiUrl && $(`#${id}`).length === 0 ) {
            if (!systemDrivers.findBy('name', driver.name)) {

              expected++;
              let script = document.createElement('script');
              script.onload = loaded;
              script.onerror = errored;
              script.src = driver.uiUrl;
              script.id = id;
              document.getElementsByTagName('BODY')[0].appendChild(script);

              expected++;
              let link = document.createElement('link');
              link.rel = 'stylesheet';
              link.id = id;
              link.href = driver.uiUrl.replace(/\.js$/,'.css');
              link.onload = loaded;
              link.onerror = errored;
              document.getElementsByTagName('HEAD')[0].appendChild(link);

              DriverChoices.drivers.push({
                name  : driver.name, //driver.name
                label : driver.name.capitalize(),
                css   : driver.name,
                sort  : 3,
                src   : driver.uiUrl
              });
            }
          }
        });

        if ( expected === 0 ) {
          resolve();
        } else {
          timer = setTimeout(function() {
            reject({type: 'error', message: 'Timeout loading custom machine drivers'});
          }, 10000);
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
