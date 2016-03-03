import Ember from 'ember';
import C from 'ui/utils/constants';

function parseStr(str) {
  let out = {};

  str = (str || '').trim();
  if (!str) {
    return out;
  }

  str.split(',').forEach((item) => {
    let key, val;
    let idx = item.indexOf('=');
    if (idx > 0) {
      key = item.substr(0, idx);
      val = item.substr(idx + 1);
    } else {
      key = C.EXTERNALID.CATALOG_DEFAULT_GROUP;
      val = item;
    }

    key = key.trim();
    val = val.trim();
    if (key && val) {
      out[key] = val;
    }
  });

  return out;
}

export default Ember.Component.extend({
  settings        : Ember.inject.service(),
  helpEnabled     : Ember.computed.alias('settings.helpEnabled'),

  keymap          : null,
  enableLibrary   : null,
  enableCommunity : null,
  editing         : true,
  saving          : false,
  disableCancel   : true,
  catalog         : null,

  actions: {
    save: function() {
      let catalogValue = this.get('catalog');
      let propsOut     = {};

      propsOut[C.SETTING.CATALOG_URL] = catalogValue;

      this.set('saving', true);

      this.get('settings').setProperties(propsOut).one('settingsPromisesResolved', () => {
        this.set('saving', false);
        this.set('errors', null);
      });
    },
    cancel: function() {},
  },

  didInitAttrs: function() {
    let map = parseStr(this.get('catalog'));

    if (map[C.CATALOG.LIBRARY_KEY] === C.CATALOG.LIBRARY_VALUE) {
      this.set('enableLibrary', true);
      delete map[C.CATALOG.LIBRARY_KEY];
    } else {
      this.set('enableLibrary', false);
    }

    if (map[C.CATALOG.COMMUNITY_KEY] === C.CATALOG.COMMUNITY_VALUE) {
      this.set('enableCommunity', true);
      delete map[C.CATALOG.COMMUNITY_KEY];
    } else {
      this.set('enableCommunity', false);
    }

    this.set('keymap', map);
  },

  keymapObserver: function() {
    let neu = {};

    // Start with ours, then load the users in case they override the value
    if (this.get('enableLibrary')) {
      neu[C.CATALOG.LIBRARY_KEY] = C.CATALOG.LIBRARY_VALUE;
    }

    if (this.get('enableCommunity')) {
      neu[C.CATALOG.COMMUNITY_KEY] = C.CATALOG.COMMUNITY_VALUE;
    }

    // Load the user's non-empty rows
    let user = this.get('keymap');

    Object.keys(user).forEach((key) => {
      let val = (user[key] || '').trim();
      key = (key || '').trim();

      if (key && val) {
        neu[key] = val;
      }
    });

    let ary = [];

    Object.keys(neu).forEach((key) => {
      ary.push(`${key}=${neu[key]}`);
    });

    this.set('catalog', ary.join(','));
  }.observes('keymap', 'enableLibrary', 'enableCommunity'),
});
