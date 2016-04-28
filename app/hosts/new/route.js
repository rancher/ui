import Ember from 'ember';
import C from 'ui/utils/constants';
import DriverChoices from 'ui/utils/driver-choices';
import Util from 'ui/utils/util';
const { getOwner } = Ember;

function proxifyUrl(url, proxyBase) {
  let parsed = Util.parseUrl(url);

  if ( parsed.hostname.indexOf('.') === -1  || // No dot, local name like localhost
      parsed.hostname.toLowerCase().match(/\.local$/) || // your-macbook.local
      parsed.origin.toLowerCase() === window.location.origin // You are here
     ) {
    return url;
  } else {
    return  proxyBase + '/' + url;
  }
}

export default Ember.Route.extend({
  access         : Ember.inject.service(),
  settings       : Ember.inject.service(),
  backTo         : null,

  queryParams: {
    driver: {
      refreshModel: true
    },
    machineId: {
      refreshModel: false,
    }
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
        this.transitionTo('swarm-tab.waiting');
      } else {
        let appRoute = getOwner(this).lookup('route:application');
        let opts     = this.get('previousOpts');

        appRoute.set('previousRoute', opts.name);
        appRoute.set('previousParams', opts.params);

        this.send('goToPrevious','hosts');
      }
    }
  },

  activate() {
    let appRoute = getOwner(this).lookup('route:application');
    this.set('previousOpts', {name: appRoute.get('previousRoute'), params: appRoute.get('previousParams')});
  },

  deactivate() {
    this.set('lastRoute', null);
  },

  resetController(controller, isExisting /*, transition*/) {
    if ( isExisting )
    {
      controller.set('machineId', null);
      controller.set('clonedModel', null);
    }
  },

  beforeModel(/*transition*/) {
    this._super(...arguments);
    return this.get('userStore').findAll('machinedriver',  {authAsUser: true}).then((drivers) => {
      return new Ember.RSVP.Promise((resolve, reject) => {
        let choices = DriverChoices.get();
        let completed = 0, expected = 0;
        let timer = null;

        function loaded() {
          completed++;
          if ( completed === expected ) {
            resolve();
            clearTimeout(timer);
          }
        }

        function errored(name) {
          clearTimeout(timer);
          reject({type: 'error', message: 'Error loading custom driver UI: ' + name});
        }

        drivers.forEach((driver) => {
          var id = 'driver-ui-js-' + driver.name;
          if (driver.uiUrl && $(`#${id}`).length === 0 ) {
            if (!choices.findBy('name', driver.name)) {

              expected++;
              let script     = document.createElement('script');
              script.onload  = function() { loaded(driver.name); };
              script.onerror = function() {errored(driver.name); };
              script.src     = proxifyUrl(driver.uiUrl, this.get('app.proxyEndpoint'));
              script.id      = id;
              document.getElementsByTagName('BODY')[0].appendChild(script);

              expected++;
              let link     = document.createElement('link');
              link.rel     = 'stylesheet';
              link.id      = id;
              link.href    = proxifyUrl(driver.uiUrl.replace(/\.js$/,'.css'), this.get('app.proxyEndpoint'));
              link.onload  = function() { loaded(driver.name); };
              link.onerror = function() { errored(driver.name); };
              document.getElementsByTagName('HEAD')[0].appendChild(link);

              DriverChoices.add({
                name   : driver.name, //driver.name
                label  : driver.name.capitalize(),
                css    : driver.name,
                sort   : 2,
                schema : `${driver.name}Config`,
                src    : driver.uiUrl,
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
      let out = null;
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

        if (params.machineId) {
          out = this.getMachine(params.machineId);
        } else {
          out = Ember.RSVP.resolve();
        }

        return out;
      });
    } else {
      if (params.machineId) {
        return this.getMachine(params.machineId);
      }
    }
  },

  getMachine(machineId) {
    return this.get('store').find('machine', machineId).then((machine) => {

      let machineOut = machine.cloneForNew();
      let config = this.get('store').createRecord(machine[`${machine.driver}Config`]);

      machine.set(`${machine.driver}Config`, config);

      this.controllerFor('hosts.new').set('clonedModel', machineOut);

      return Ember.RSVP.resolve();
    }).catch(() => {
      return Ember.RSVP.reject({type: 'error', message: 'Failed to retrieve cloned model'}) ;
    });
  },
});
