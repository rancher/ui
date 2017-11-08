import EmberObject from '@ember/object';
import {
  resolve,
  all,
  reject,
  hash,
  Promise as EmberPromise
} from 'rsvp';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import Util from 'ui/utils/util';

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

export default Service.extend({
  userStore: service('user-store'),
  access         : service(),
  projects       : service(),
  settings       : service(),

  machineDrivers: null,
  defaultDriver: '',

  loadAllDrivers() {
    let us = this.get('userStore');
    let drivers = [];

    return us.findAll('machinedriver').then((possible) => {
      let promises = [];

      possible.filterBy('state','active').forEach((driver) => {
        let schemaName = driver.get('name') + 'Config';
        promises.push(us.find('schema', schemaName).then(() => {
          drivers.push(driver);
        }).catch(() => {
          return resolve();
        }));
      });

      return all(promises);
    }).then(() => {
      this.set('machineDrivers', drivers);
      return resolve(drivers);
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
      return reject({type: 'error', message: 'Failed to retrieve cloned model'});
    });
  },

  getModel(params=null) {
    let promises = {
      reloadHost: this.get('userStore').find('schema','host', {forceReload: true}),
      loadCustomUi: this.loadCustomUi(),
      schemas: this.get('userStore').find('schema'),
      typeDocumentations: this.get('userStore').findAll('typedocumentation')
    };

    if (params && params.hostId )
    {
      promises.clonedModel = this.getHost(params.hostId);
    }


    if ( this.get('access.admin') ) {
      let settings = this.get('settings');
      promises.apiHostSet = settings.load(C.SETTING.API_HOST).then(() => {
        return !!settings.get(C.SETTING.API_HOST);
      });
    } else {
      promises.apiHostSet = resolve(true);
    }

    return hash(promises).then((hash) => {
      hash.availableDrivers = this.get('machineDrivers');
      if ( this.get('projects.current.isWindows') ) {
        hash.availableDrivers = [];
      }

      return EmberObject.create(hash);
    });
  },

  // Loads the custom UI CSS/JS for drivers that have a uiUrl,
  loadCustomUi() {
    return new EmberPromise((resolve, reject) => {
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
});
