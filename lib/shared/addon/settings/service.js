import { alias } from '@ember/object/computed';
import { Promise as EmberPromise } from 'rsvp';
import { isArray } from '@ember/array';
import Evented from '@ember/object/evented';
import Service, { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import { minorVersion, isDevBuild } from 'shared/utils/parse-version';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { isEmpty } from '@ember/utils';
import { eachLimit } from 'async';

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

  all:              null,
  promiseCount:     0,
  showHeaderBanner: false,
  showFooterBanner: false,

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
      }).catch((err) => {
        get(this, 'growl').fromError(err);
      }).finally(() => {
        this.decrementProperty('promiseCount');
      });
    }

    return value;
  },

  promiseCountObserver: observer('promiseCount', function() {
    if (get(this, 'promiseCount') <= 0) {
      this.trigger('settingsPromisesResolved');
    }
  }),

  findByName(name) {
    return get(this, 'asMap')[normalizeName(name)];
  },

  loadAll() {
    return get(this, 'globalStore').findAll('setting');
  },

  load(names) {
    if ( !isArray(names) ) {
      names = [names];
    }

    var globalStore = get(this, 'globalStore');

    var promise = new EmberPromise((resolve, reject) => {
      eachLimit(names, 3, (name, cb) => {
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

  cliVersion:                 alias(`asMap.${ C.SETTING.VERSION_CLI }.value`),
  dockerMachineVersion:       alias(`asMap.${ C.SETTING.VERSION_MACHINE }.value`),
  helmVersion:                alias(`asMap.${ C.SETTING.VERSION_HELM }.value`),
  minDockerVersion:           alias(`asMap.${ C.SETTING.MIN_DOCKER }.value`),
  rancherImage:               alias(`asMap.${ C.SETTING.IMAGE_RANCHER }.value`),
  rancherVersion:             alias(`asMap.${ C.SETTING.VERSION_RANCHER }.value`),
  serverUrl:                  alias(`asMap.${ C.SETTING.SERVER_URL }.value`),
  clusterTemplateEnforcement: alias(`asMap.${ C.SETTING.CLUSTER_TEMPLATE_ENFORCEMENT }.value`),
  uiBanners:                  alias(`asMap.${ C.SETTING.UI_BANNERS }.value`),
  uiIssues:                   alias(`asMap.${ C.SETTING.UI_ISSUES }.value`),

  asMap: computed('all.@each.{name,value,customized}', function() {
    var out = {};

    (get(this, 'all') || []).forEach((setting) => {
      var name = normalizeName(setting.get('name'));

      out[name] = setting;
    });

    return out;
  }),

  uiVersion: computed('app.version', function() {
    return `v${  get(this, 'app.version') }`;
  }),

  githubIssueUrl: computed('app.currentRouteName', 'access.{provider,admin}', 'rancherVersion', 'uiVersion', function() {
    var str = '*Describe your issue here*\n\n\n---\n| Useful | Info |\n| :-- | :-- |\n' +
        `|Versions|Rancher \`${ get(this, 'rancherVersion') || '-' }\` ` +
        `UI: \`${ get(this, 'uiVersion') || '--' }\` |\n`;

    str += `|Route|\`${ get(this, 'app.currentRouteName') }\`|\n`;

    var url = `${ C.EXT_REFERENCES.GITHUB  }/issues/new?body=${  encodeURIComponent(str) }`;

    return url;
  }),

  issueUrl: computed('githubIssueUrl', 'uiIssues', function() {
    return get(this, 'uiIssues') || get(this, 'githubIssueUrl');
  }),

  serverUrlIsEmpty:     computed('serverUrl', function() {
    return isEmpty(get(this, 'serverUrl'));
  }),

  isRancher: computed(C.SETTING.PL, function() {
    const out = (get(this, C.SETTING.PL) || '').toUpperCase() === C.SETTING.PL_RANCHER_VALUE.toUpperCase();

    return out;
  }),

  isEnterprise: computed('rancherImage', function() {
    return get(this, 'rancherImage') === 'rancher/enterprise';
  }),

  appName: computed('isRancher', C.SETTING.PL, function() {
    if ( get(this, 'isRancher') ) {
      return get(this, 'app.appName');
    }

    return get(this, C.SETTING.PL) || '';
  }),

  minorVersion: computed('rancherVersion', function() {
    let version = get(this, 'rancherVersion');

    if ( !version ) {
      return null;
    }

    return minorVersion(version);
  }),

  docsBase: computed('intl.locale', 'minorVersion', function() {
    let full = get(this, 'rancherVersion');
    let version;

    if ( !full || isDevBuild(full) ) {
      if (get(this, 'uiVersion').includes('master-dev')) {
        version = 'v2.x';
      } else {
        version = minorVersion(get(this, 'uiVersion'));
      }
    } else {
      version = minorVersion(full);
    }

    version = version.replace(/\.\d+$/, '.x');

    let lang = ((get(this, 'intl.locale') || [])[0] || '').replace(/-.*$/, '');

    if ( !lang || lang === 'none' || C.LANGUAGE.DOCS.indexOf(lang) === -1 ) {
      lang = 'en';
    }

    return `${ C.EXT_REFERENCES.DOCS }/${ version }/${ lang }`;
  }),

  showBanners: observer('uiBanners.@each.{showHeader,showFooter}', function() {
    const uiBanners = get(this, 'uiBanners');

    if (isEmpty(uiBanners)) {
      setProperties(this, {
        showHeaderBanner: false,
        showFooterBanner: false,
      });
    } else {
      let parsedBanners = {}

      try {
        parsedBanners = JSON.parse(uiBanners);
      } catch {
        // catch SyntaxError
        setProperties(this, {
          showHeaderBanner: false,
          showFooterBanner: false,
        });

        return
      }

      if (isEmpty(parsedBanners.showHeader) || typeof parsedBanners.showHeader !== 'string' || parsedBanners.showHeader.toLowerCase() !== 'true') {
        set(this, 'showHeaderBanner', false);
      } else {
        set(this, 'showHeaderBanner', true);
      }

      if (isEmpty(parsedBanners.showFooter) || typeof parsedBanners.showFooter !== 'string' || parsedBanners.showFooter.toLowerCase() !== 'true') {
        set(this, 'showFooterBanner', false);
      } else {
        set(this, 'showFooterBanner', true);
      }
    }
  }),

  bannerContent: computed('uiBanners.@each.{banner}', 'showHeaderBanner', 'showFooterBanner', function() {
    const uiBanners = get(this, 'uiBanners');

    let parsedBanners = {}

    try {
      parsedBanners = JSON.parse(uiBanners);
    } catch {
      // catch SyntaxError
    }

    const banner = get(parsedBanners, 'banner');

    if (!isEmpty(banner)) {
      return banner;
    }

    return {};
  }),


  eulaLink: C.EXT_REFERENCES.EULA,
});
