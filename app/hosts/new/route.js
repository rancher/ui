import Ember from 'ember';
import C from 'ui/utils/constants';
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
  projects       : Ember.inject.service(),
  settings       : Ember.inject.service(),
  backTo         : null,

  defaultDriver: 'custom',
  lastDriver: null,

  queryParams: {
    driver: {
      refreshModel: true
    },
    hostId: {
      refreshModel: false,
    }
  },

  actions: {
    cancel() {
      this.send('goBack');
    },

    savedHost() {
      this.refresh();
    },

    goBack() {
      if ( this.get('backTo') === 'waiting' ) {
        this.transitionTo('authenticated.project.waiting');
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

    let us = this.get('userStore');
    let drivers = [];

    return us.find('machinedriver', null, {forceReload: true}).then((possible) => {
      let promises = [];

      possible.filterBy('state','active').forEach((driver) => {
        let schemaName = driver.get('name') + 'Config';
        promises.push(us.find('schema', schemaName).then(() => {
          drivers.push(driver);
        }).catch(() => {
          return Ember.RSVP.resolve();
        }));
      });

      return Ember.RSVP.all(promises);
    }).then(() => {
      this.set('machineDrivers', drivers);
    });
  },

  model(params) {
    this.set('backTo', params.backTo);

    let promises = {
      reloadHost: this.get('userStore').find('schema','host', {forceReload: true}),
      loadCustomUi: this.loadCustomUi(),
      schemas: this.get('userStore').find('schema'),
      typeDocumentations: this.get('userStore').findAll('typedocumentation') 
    };

    if ( params.hostId )
    {
      promises.clonedModel = this.getHost(params.hostId);
    }

    if ( this.get('access.admin') ) {
      let settings = this.get('settings');
      promises.apiHostSet = settings.load(C.SETTING.API_HOST).then(() => {
        return !!settings.get(C.SETTING.API_HOST);
      });
    } else {
      promises.apiHostSet = Ember.RSVP.resolve(true);
    }

    return Ember.RSVP.hash(promises).then((hash) => {
      hash.availableDrivers = this.get('machineDrivers');
      if ( this.get('projects.current.isWindows') ) {
        hash.availableDrivers = [];
      }

      let defaultDriver = this.get('defaultDriver');
      let targetDriver = params.driver || this.get('lastDriver') || defaultDriver;

      // If custom is disabled, pick the first one as default
      if ( this.get(`settings.${C.SETTING.SHOW_CUSTOM_HOST}`) === false && targetDriver === 'custom') {
        targetDriver = hash.availableDrivers.map(x => x.get('name')).sort()[0];
      }

      // If a specific driver is chosen and not available, switch to default
      if ( ['custom','other'].indexOf(targetDriver) === -1 && hash.availableDrivers.filterBy('name', targetDriver).length === 0 )
      {
        targetDriver = defaultDriver;
      }


      if ( params.driver !== targetDriver )
      {
        this.transitionTo('hosts.new', {queryParams: {driver: targetDriver}});
      }
      else
      {
        return Ember.Object.create(hash);
      }
    });
  },

  // Loads the custom UI CSS/JS for drivers that have a uiUrl,
  loadCustomUi() {
    return new Ember.RSVP.Promise((resolve, reject) => {
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

      // machineDrivers already contains only the active ones with a schema
      this.get('machineDrivers').forEach((driver) => {
        let id = 'driver-ui-js-' + driver.name;
        if (driver.uiUrl && $(`#${id}`).length === 0 ) {
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
  },

  getHost(hostId) {
    let store = this.get('store');
    return store.find('host', hostId).then((host) => {

      let hostOut = host.cloneForNew();
      let src = host[`${host.driver}Config`];
      if ( src ) {
        src.type = `${host.driver}Config`;
        let config = store.createRecord(src);
        hostOut.set(`${host.driver}Config`, config);
      }
      return hostOut;
    }).catch(() => {
      return Ember.RSVP.reject({type: 'error', message: 'Failed to retrieve cloned model'}) ;
    });
  },
});
