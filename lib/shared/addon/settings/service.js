import { alias } from '@ember/object/computed';
import { resolve, Promise as EmberPromise } from 'rsvp';
import { isArray } from '@ember/array';
import Evented from '@ember/object/evented';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { minorVersion } from 'shared/utils/parse-version';

export function normalizeName(str) {
  return str; //.replace(/\./g, C.SETTING.DOT_CHAR).toLowerCase();
}

export function denormalizeName(str) {
  return str; //.replace(new RegExp('['+C.SETTING.DOT_CHAR+']','g'),'.').toLowerCase();
}

export default Service.extend(Evented, {
  access: service(),
  cookies: service(),
  scope: service(),
  intl: service(),
  globalStore: service(),
  app: service(),

  all: null,
  promiseCount: 0,

  init() {
    this._super();
    this.set('all', this.get('globalStore').all('setting'));
  },

  unknownProperty(key) {
    var obj = this.findByName(key);
    if ( obj )
    {
      var val = obj.get('value');
      if ( val === 'false' )
      {
        return false;
      }
      else if ( val === 'true' )
      {
        return true;
      }
      else
      {
        return val;
      }
    }

    return null;
  },

  setUnknownProperty(key, value) {
    if (key !== 'app') {
      var obj = this.findByName(key);

      if ( value === undefined )
      {
        // Delete by set to undefined is not needed for settings
        throw new Error('Deleting settings is not supported');
      }

      if ( !obj )
      {
        obj = this.get('globalStore').createRecord({
          type: 'setting',
          name: denormalizeName(key),
        });
      }

      this.incrementProperty('promiseCount');

      obj.set('value', value+''); // Values are all strings in settings.
      obj.save().then(() => {
        this.notifyPropertyChange(normalizeName(key));
      }).catch((err) => {
        console.log('Error saving setting:', err);
      }).finally(() => {
        this.decrementProperty('promiseCount');
      });

    }
    return value;
  },

  promiseCountObserver: function() {

    if (this.get('promiseCount') <= 0) {
      this.trigger('settingsPromisesResolved');
    }
  }.observes('promiseCount'),

  findByName(name) {
    return this.get('asMap')[normalizeName(name)];
  },

  loadAll() {
    return this.get('globalStore').find('setting');
  },

  load(names) {
    let TRUE = true;
    if ( TRUE ) { // @TODO-2.0
      return resolve();
    }

    if ( !isArray(names) ) {
      names = [names];
    }

    var globalStore = this.get('globalStore');

    var promise = new EmberPromise((resolve, reject) => {
      async.eachLimit(names, 3, function(name, cb) {
        globalStore
          .find('setting', denormalizeName(name))
          .then(function() { cb(); })
          .catch(function(err) { cb(err); });
      }, function(err) {
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
    (this.get('all')||[]).forEach((setting) => {
      var name = normalizeName(setting.get('name'));
      out[name] = setting;
    });

    return out;
  }.property('all.@each.{name,value}'),

  uiVersion: function() {
    return 'v' + this.get('app.version');
  }.property('app.version'),

  issueUrl: function() {
    var str = '*Describe your issue here*\n\n\n---\n| Useful | Info |\n| :-- | :-- |\n' +
      `|Versions|Rancher \`${this.get('rancherVersion')||'-'}\` ` +
        `UI: \`${this.get('uiVersion')||'--'}\` |\n`;

      if ( this.get('access.enabled') )
      {
        let provider = (this.get('access.provider')||'').replace(/config/,'');
        str += `|Access|\`${provider}\` ${this.get('access.admin') ? '\`admin\`' : ''}|\n`;
      }
      else
      {
        str += '|Access|`Disabled`|\n';
      }

      str += `|Route|\`${this.get('app.currentRouteName')}\`|\n`;

    var url = C.EXT_REFERENCES.GITHUB + '/issues/new?body=' + encodeURIComponent(str);
    return url;
  }.property('app.currentRouteName','access.{provider,admin}','rancherVersion','uiVersion'),

  rancherImage: alias(`asMap.${C.SETTING.IMAGE_RANCHER}.value`),
  rancherVersion: alias(`asMap.${C.SETTING.VERSION_RANCHER}.value`),
  cliVersion: alias(`asMap.${C.SETTING.VERSION_CLI}.value`),
  dockerMachineVersion: alias(`asMap.${C.SETTING.VERSION_MACHINE}.value`),
  helmVersion: alias(`asMap.${C.SETTING.VERSION_HELM}.value`),

  _plValue: function() {
    let TRUE=true; // @TODO-2.0
    if ( TRUE ) {
      return 'rancher';
    }
    return this.get(`cookies.${C.COOKIE.PL}`) || '';
  }.property(`cookies.${C.COOKIE.PL}`),

  isRancher: function() {
    return this.get('_plValue').toUpperCase() === C.COOKIE.PL_RANCHER_VALUE.toUpperCase();
  }.property('_plValue'),

  isEnterprise: function() {
    return this.get('rancherImage') === 'rancher/enterprise';
  }.property('rancherImage'),

  appName: function() {
    var isCaas = this.get('app.mode') === 'caas' ? true : false;

    if (isCaas) {
      return 'Rancher Container Cloud';
    } else {
      if ( this.get('isRancher') )
      {
        return this.get('app.appName') || "Rancher"; // Rancher
      }
      else
      {
        return this.get('_plValue');
      }
    }
  }.property('isRancher','_plValue'),

  minDockerVersion: alias(`asMap.${C.SETTING.MIN_DOCKER}.value`),

  minorVersion: function() {
    let version = this.get('rancherVersion');
    if ( !version )
    {
      return null;
    }

    return minorVersion(version);
  }.property('rancherVersion'),

  docsBase: function() {
    let full = this.get('rancherVersion');
    let version;
    if ( full ) {
      version = minorVersion(full);
    } else {
      version = minorVersion(this.get('uiVersion'));
    }

    let lang = ((this.get('intl.locale')||[])[0]||'').replace(/-.*$/,'');
    if ( !lang || lang === 'none' || C.LANGUAGE.DOCS.indexOf(lang) === -1 ) {
      lang = 'en';
    }

    return `${C.EXT_REFERENCES.DOCS}/${version}/${lang}`;
  }.property('intl.locale','minorVersion')
});
