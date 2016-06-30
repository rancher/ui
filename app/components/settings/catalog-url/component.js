import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseCatalogSetting } from 'ui/utils/parse-catalog-setting';

export default Ember.Component.extend({
  settings        : Ember.inject.service(),

  keymap          : null,
  enableLibrary   : null,
  enableCommunity : null,
  catalog         : null,

  actions: {
    save: function(btnCb) {
      this.get('settings').set(C.SETTING.CATALOG_URL, this.get('catalog'));
      this.get('settings').one('settingsPromisesResolved', () => {
        btnCb(true);
        this.sendAction('saved');
      });
    },
  },

  init() {
    this._super(...arguments);


    let map = parseCatalogSetting(this.get('catalog'));
    let library = false;
    let community = false;

    if (map[C.CATALOG.LIBRARY_KEY] === C.CATALOG.LIBRARY_VALUE) {
      library = true;
      delete map[C.CATALOG.LIBRARY_KEY];
    }

    if (map[C.CATALOG.COMMUNITY_KEY] === C.CATALOG.COMMUNITY_VALUE) {
      community = true;
      delete map[C.CATALOG.COMMUNITY_KEY];
    }

    this.setProperties({
      keymap: map,
      enableLibrary: library,
      enableCommunity: community
    });
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
