import Ember from 'ember';
import { addQueryParams } from 'ui/utils/util';
import C from 'ui/utils/constants';

function uniqKeys(data, name) {
  let out = data.map((item) => item[name]);
  out = out.uniq().sort((a,b) => a.localeCompare(b, 'en', {sensitivity: 'base'}));
  out.unshift('all');
  return out;
}

export default Ember.Route.extend({
  settings: Ember.inject.service(),
  projects: Ember.inject.service(),

  cache: null,

  queryParams: {
    category: {
      refreshModel: true
    },
    catalogId: {
      refreshModel: true
    }
  },

  actions: {
    refresh: function() {
      // Clear the cache so it has to ask the server again
      this.set('cache', null);
      this.refresh();
    },
  },

  catalogs: null,
  uniqueCatalogIds: null,

  templateBase: function() {
    if ( this.get('projects.current.kubernetes') )
    {
      return 'kubernetes';
    }
    else if ( this.get('projects.current.swarm') )
    {
      return 'swarm';
    }
    else if ( this.get('projects.current.mesos') )
    {
      return 'mesos';
    }
    else
    {
      return 'cattle';
    }
  }.property('projects.current.{kubernetes,swarm}'),

  deactivate() {
    // Clear the cache when leaving the route so that it will be reloaded when you come back.
    this.set('cache', null);
  },

  beforeModel: function() {
    this._super(...arguments);
    var auth = this.modelFor('authenticated');
    return this.get('projects').checkForWaiting(auth.get('hosts'),auth.get('machines')).then(() => {
      return this.get('store').request({url: `${this.get('app.catalogEndpoint')}/catalogs`}).then((response) => {
        this.set('catalogs', response);
        let ids = uniqKeys(response, 'id');
        this.set('uniqueCatalogIds', ids);
      });
    });
  },

  model(params) {
    let cache        = this.get('cache');
    let templateBase = this.get('templateBase');
    let version      = this.get('settings.rancherVersion');
    let catalogId    = params.catalogId;
    let url          = null;
    let combined     = false;
    let store        = this.get('store');
    let qp           = {
      'category_ne': 'system',
    };

    // If the catalogIds dont match we need to go get the other catalog from the store since we do not cache all catalogs
    if ( cache && cache.catalogId === catalogId)
    {
      return filter(cache, params.category, this.get('uniqueCatalogIds'));
    }

    if (catalogId) {
      this.controllerFor('catalog-tab.index').set('selectedCatalog', catalogId);

      if (catalogId === 'library') {
        combined = true;
      } else if (catalogId !== 'all') {
        qp['catalogId'] = catalogId;
      }
    }

    if ( version )
    {
      qp['minimumRancherVersion_lte'] = version;
    }

    if (combined) {
      url = {};
      [C.CATALOG.LIBRARY_KEY,C.CATALOG.COMMUNITY_KEY].forEach((key) => {
        let tmpQp = qp;
        tmpQp['catalogId'] = key;
        url[key] = addQueryParams(`${this.get('app.catalogEndpoint')}/templates`, tmpQp);
      });
      return Ember.RSVP.all([
        store.request({url : url[C.CATALOG.LIBRARY_KEY]}),
        store.request({url : url[C.CATALOG.COMMUNITY_KEY]})
      ]).then((arrays) => {
        let tmpArr = [];
        arrays.forEach((ary) => {
          tmpArr = tmpArr.concat(ary.content);
        });
        tmpArr.catalogId = catalogId;
        this.set('cache', tmpArr);
        return filter(tmpArr, params.category, this.get('uniqueCatalogIds'));
      });
    } else {
      url = addQueryParams(`${this.get('app.catalogEndpoint')}/templates`, qp);

      return store.request({url: url}).then((response) => {
        response.catalogId = catalogId;
        this.set('cache', response);
        return filter(response, params.category, this.get('uniqueCatalogIds'));
      });
    }

    function filter(data, category, catalogIds) {
      data = data.filterBy('templateBase', (templateBase === 'cattle' ? '' : templateBase));
      let categories = uniqKeys(data, 'category');

      if ( category !== 'all' ) {
        data = data.filterBy('category', category);
      }

      data = data.sortBy('name');

      data.forEach((item) => {
        if (item.catalogId === C.CATALOG.LIBRARY_KEY) {
          Ember.set(item, 'official', true);
        }
      });

      return Ember.Object.create({
        categories: categories,
        uniqueCatalogIds: catalogIds,
        catalog: data,
        templateBase: templateBase,
      });
    }
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('category', 'all');
      controller.set('catalogId', 'all');
    }
  }
});
