import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseCatalogSetting } from 'ui/utils/parse-catalog-setting';

export default Ember.Component.extend({
  settings: Ember.inject.service(),
  catalog: Ember.inject.service(),

  initialValue: null,

  parsed: null,
  ary: null,
  enableLibrary: null,
  enableCommunity: null,

  actions: {
    add() {
      this.get('ary').pushObject(Ember.Object.create({name: '', branch: C.CATALOG.DEFAULT_BRANCH, url: ''}));
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.name').last()[0].focus();
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
        // Sigh...
        setTimeout(() => {
          this.get('catalog').refresh().catch(() => {
            setTimeout(() => {
              this.get('catalog').refresh();
            }, 5000);
          }).finally(() => {
            btnCb(true);
            this.sendAction('saved');
          });
        },5000);
      });
    },
  },

  init() {
    this._super(...arguments);

    const def = C.CATALOG.DEFAULT_BRANCH;
    let parsed = parseCatalogSetting(this.get('initialValue'));
    let map = parsed.catalogs || {};

    let library = false;
    let entry = map[C.CATALOG.LIBRARY_KEY];
    if ( entry && entry.url === C.CATALOG.LIBRARY_VALUE && entry.branch === def ) {
      library = true;
      delete map[C.CATALOG.LIBRARY_KEY];
    }

    let community = false;
    entry = map[C.CATALOG.COMMUNITY_KEY];
    if ( entry && entry.url === C.CATALOG.COMMUNITY_VALUE && entry.branch === def ) {
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
