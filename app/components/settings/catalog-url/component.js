import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseCatalogSetting } from 'ui/utils/parse-catalog-setting';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  initialValue: null,

  parsed: null,
  ary: null,
  enableLibrary: null,
  enableCommunity: null,

  actions: {
    add() {
      this.get('ary').pushObject(Ember.Object.create({name: '', branch: 'master', url: ''}));
      Ember.run.next(() => {
        if ( this._state !== 'destroying' )
        {
          this.$('INPUT.name').last()[0].focus();
        }
      });
    },

    remove(obj) {
      this.get('ary').removeObject(obj);
    },

    save(btnCb) {
      const def = C.CATALOG.DEFAULT_BRANCH;

      let map = {};
      // Start with ours, then load the users in case they override the value
      if (this.get('enableLibrary')) {
        map[C.CATALOG.LIBRARY_KEY] = {url: C.CATALOG.LIBRARY_VALUE, branch: def};
      }

      if (this.get('enableCommunity')) {
        map[C.CATALOG.COMMUNITY_KEY] = {url: C.CATALOG.COMMUNITY_VALUE, branch: def};
      }

      // Load the user's non-empty rows
      this.get('ary').forEach((row) => {
        let name = (row.name||'').trim();
        let url = (row.url||'').trim();
        let branch = (row.branch||'').trim() || def;

        if (name && url) {
          map[name] = {url: url, branch: branch};
        }
      });

      let neu = this.get('parsed')||{};
      neu.catalogs = map;

      this.get('settings').set(C.SETTING.CATALOG_URL, JSON.stringify(neu));
      this.get('settings').one('settingsPromisesResolved', () => {
        btnCb(true);
        this.sendAction('saved');
      });
    },
  },

  init() {
    this._super(...arguments);

    let parsed = parseCatalogSetting(this.get('initialValue'));
    let map = parsed.catalogs || {};

    let library = false;
    if (map[C.CATALOG.LIBRARY_KEY] && map[C.CATALOG.LIBRARY_KEY].url=== C.CATALOG.LIBRARY_VALUE) {
      library = true;
      delete map[C.CATALOG.LIBRARY_KEY];
    }

    let community = false;
    if (map[C.CATALOG.COMMUNITY_KEY] && map[C.CATALOG.COMMUNITY_KEY].url === C.CATALOG.COMMUNITY_VALUE) {
      community = true;
      delete map[C.CATALOG.COMMUNITY_KEY];
    }

    var ary = [];
    Object.keys(map).forEach((name) => {
      ary.push(Ember.Object.create({name: name, branch: map[name].branch, url: map[name].url}));
    });

    this.setProperties({
      ary: ary,
      parsed: parsed,
      enableLibrary: library,
      enableCommunity: community
    });
  },
});
