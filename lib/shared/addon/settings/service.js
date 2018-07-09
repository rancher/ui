import { alias } from '@ember/object/computed';
import { resolve, Promise as EmberPromise } from 'rsvp';
import { isArray } from '@ember/array';
import Evented from '@ember/object/evented';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { minorVersion } from 'shared/utils/parse-version';
import {
  get, set, computed
} from '@ember/object';
import { isEmpty } from '@ember/utils';

export function normalizeName(str) {

  return str; // .replace(/\./g, C.SETTING.DOT_CHAR).toLowerCase();

}

export function denormalizeName(str) {

  return str; // .replace(new RegExp('['+C.SETTING.DOT_CHAR+']','g'),'.').toLowerCase();

}

export default Service.extend(Evented, {
  access:      service(),
  cookies:     service(),
  scope:       service(),
  intl:        service(),
  growl:       service(),
  globalStore: service(),
  app:         service(),

  all:          null,
  promiseCount: 0,

  init() {

    this._super();
    set(this, 'all', get(this, 'globalStore').all('setting'));

  },

  unknownProperty(key) {

    var obj = this.findByName(key);

    if ( obj ) {

      var val = obj.get('value');

      if ( val === 'false' ) {

        return false;

      } else if ( val === 'true' ) {

        return true;

      } else {

        return val;

      }

    }

    return null;

  },

  setUnknownProperty(key, value) {

    if (key !== 'app') {

      var obj = this.findByName(key);

      if ( value === undefined ) {

        // Delete by set to undefined is not needed for settings
        throw new Error('Deleting settings is not supported');

      }

      if ( obj ) {

        obj = obj.clone();

      } else {

        obj = get(this, 'globalStore').createRecord({
          type: 'setting',
          name: denormalizeName(key),
        });

      }

      this.incrementProperty('promiseCount');

      obj.set('value', `${ value }`); // Values are all strings in settings.
      obj.save().then(() => {

        this.notifyPropertyChange(normalizeName(key));

      })
        .catch((err) => {

          get(this, 'growl').fromError(err);

        })
        .finally(() => {

          this.decrementProperty('promiseCount');

        });

    }

    return value;

  },

  promiseCountObserver: function() {

    if (get(this, 'promiseCount') <= 0) {

      this.trigger('settingsPromisesResolved');

    }

  }.observes('promiseCount'),

  findByName(name) {

    return get(this, 'asMap')[normalizeName(name)];

  },

  loadAll() {

    return get(this, 'globalStore').find('setting');

  },

  load(names) {

    let TRUE = true;

    if ( TRUE ) { // @TODO-2.0

      return resolve();

    }

    if ( !isArray(names) ) {

      names = [names];

    }

    var globalStore = get(this, 'globalStore');

    var promise = new EmberPromise((resolve, reject) => {

      async.eachLimit(names, 3, (name, cb) => {

        globalStore
          .find('setting', denormalizeName(name))
          .then(() => {

            cb();

          })
          .catch((err) => {

            cb(err);

          });

      }, (err) => {

        if ( err ) {

          reject(err);

        } else {

          resolve();

        }

      });

    });

    return promise;

  },

  asMap: function() {

    var out = {};

    (get(this, 'all') || []).forEach((setting) => {

      var name = normalizeName(setting.get('name'));

      out[name] = setting;

    });

    return out;

  }.property('all.@each.{name,value}'),

  uiVersion: function() {

    return `v${  get(this, 'app.version') }`;

  }.property('app.version'),

  issueUrl: function() {

    var str = '*Describe your issue here*\n\n\n---\n| Useful | Info |\n| :-- | :-- |\n' +
      `|Versions|Rancher \`${ get(this, 'rancherVersion') || '-' }\` ` +
        `UI: \`${ get(this, 'uiVersion') || '--' }\` |\n`;

    if ( get(this, 'access.enabled') ) {

      let provider = (get(this, 'access.provider') || '').replace(/config/, '');

      str += `|Access|\`${ provider }\` ${ get(this, 'access.admin') ? '\`admin\`' : '' }|\n`;

    } else {

      str += '|Access|`Disabled`|\n';

    }

    str += `|Route|\`${ get(this, 'app.currentRouteName') }\`|\n`;

    var url = `${ C.EXT_REFERENCES.GITHUB  }/issues/new?body=${  encodeURIComponent(str) }`;

    return url;

  }.property('app.currentRouteName', 'access.{provider,admin}', 'rancherVersion', 'uiVersion'),

  rancherImage:         alias(`asMap.${ C.SETTING.IMAGE_RANCHER }.value`),
  rancherVersion:       alias(`asMap.${ C.SETTING.VERSION_RANCHER }.value`),
  cliVersion:           alias(`asMap.${ C.SETTING.VERSION_CLI }.value`),
  dockerMachineVersion: alias(`asMap.${ C.SETTING.VERSION_MACHINE }.value`),
  helmVersion:          alias(`asMap.${ C.SETTING.VERSION_HELM }.value`),
  serverUrl:            alias(`asMap.${ C.SETTING.SERVER_URL }.value`),
  serverUrlIsEmpty:     computed('serverUrl', function() {

    return isEmpty(get(this, 'serverUrl'));

  }),

  _plValue: function() {

    let TRUE = true; // @TODO-2.0

    if ( TRUE ) {

      return 'rancher';

    }

    return get(this, `cookies.${ C.COOKIE.PL }`) || '';

  }.property(`cookies.${ C.COOKIE.PL }`),

  isRancher: function() {

    return get(this, '_plValue').toUpperCase() === C.COOKIE.PL_RANCHER_VALUE.toUpperCase();

  }.property('_plValue'),

  isEnterprise: function() {

    return get(this, 'rancherImage') === 'rancher/enterprise';

  }.property('rancherImage'),

  appName: function() {

    var isCaas = get(this, 'app.mode') === 'caas' ? true : false;

    if (isCaas) {

      return 'Rancher Container Cloud';

    } else {

      if ( get(this, 'isRancher') ) {

        return get(this, 'app.appName') || 'Rancher'; // Rancher

      } else {

        return get(this, '_plValue');

      }

    }

  }.property('isRancher', '_plValue'),

  minDockerVersion: alias(`asMap.${ C.SETTING.MIN_DOCKER }.value`),

  minorVersion: function() {

    let version = get(this, 'rancherVersion');

    if ( !version ) {

      return null;

    }

    return minorVersion(version);

  }.property('rancherVersion'),

  docsBase: function() {

    let full = get(this, 'rancherVersion');
    let version;

    if ( full && full !== 'master' ) {

      version = minorVersion(full);

    } else {

      version = minorVersion(get(this, 'uiVersion'));

    }

    version = version.replace(/\.\d+$/, '.x');

    let lang = ((get(this, 'intl.locale') || [])[0] || '').replace(/-.*$/, '');

    if ( !lang || lang === 'none' || C.LANGUAGE.DOCS.indexOf(lang) === -1 ) {

      lang = 'en';

    }

    return `${ C.EXT_REFERENCES.DOCS }/${ version }/${ lang }`;

  }.property('intl.locale', 'minorVersion')
});
