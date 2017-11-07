import { next } from '@ember/runloop';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import { parseCatalogSetting } from 'ui/utils/parse-catalog-setting';
import layout from './template';

export default Component.extend({
  layout,
  settings: service(),
  catalog: service(),
  kindChoices: [
    {translationKey: 'catalogSettings.more.kind.native', value: 'native'},
    {translationKey: 'catalogSettings.more.kind.helm', value: 'helm'},
  ],

  initialValue: null,

  parsed: null,
  ary: null,
  enableLibrary: null,
  enableCommunity: null,

  actions: {
    add() {
      this.get('ary').pushObject(EmberObject.create({name: '', branch: C.CATALOG.DEFAULT_BRANCH, kind: 'native', url: ''}));
      next(() => {
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
        map[C.CATALOG.LIBRARY_KEY] = {url: C.CATALOG.LIBRARY_VALUE, branch: C.CATALOG.LIBRARY_BRANCH};
      }

      if (this.get('enableCommunity')) {
        map[C.CATALOG.COMMUNITY_KEY] = {url: C.CATALOG.COMMUNITY_VALUE, branch: C.CATALOG.COMMUNITY_BRANCH};
      }

      // Load the user's non-empty rows
      this.get('ary').forEach((row) => {
        let name = (row.name||'').trim();
        let url = (row.url||'').trim();
        let branch = (row.branch||'').trim() || def;
        let kind = (row.kind||'').trim() || 'native';

        if (name && url) {
          map[name] = {url: url, branch: branch, kind: kind};
        }
      });

      let neu = this.get('parsed')||{};
      neu.catalogs = map;

      this.get('settings').set(C.SETTING.CATALOG_URL, JSON.stringify(neu));
      this.get('settings').one('settingsPromisesResolved', () => {
        btnCb(true);
        this.sendAction('saved');
        this.get('catalog').reset();
      });
    },
  },

  init() {
    this._super(...arguments);

    // const def = C.CATALOG.DEFAULT_BRANCH;
    let parsed = parseCatalogSetting(this.get('initialValue'));
    let map = parsed.catalogs || {};

    let library = false;
    let entry = map[C.CATALOG.LIBRARY_KEY];
    if ( entry && entry.url === C.CATALOG.LIBRARY_VALUE && entry.branch === C.CATALOG.LIBRARY_BRANCH ) {
      library = true;
      delete map[C.CATALOG.LIBRARY_KEY];
    }

    let community = false;
    entry = map[C.CATALOG.COMMUNITY_KEY]
    if ( entry && entry.url === C.CATALOG.COMMUNITY_VALUE && entry.branch === C.CATALOG.COMMUNITY_BRANCH ) {
      community = true;
      delete map[C.CATALOG.COMMUNITY_KEY];
    }

    var ary = [];
    Object.keys(map).forEach((name) => {
      ary.push(EmberObject.create({name: name, kind: map[name].kind||'native', branch: map[name].branch, url: map[name].url}));
    });

    this.setProperties({
      ary: ary,
      parsed: parsed,
      enableLibrary: library,
      enableCommunity: community
    });
  },
});
