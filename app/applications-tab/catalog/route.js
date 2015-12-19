import Ember from 'ember';
import { addQueryParams } from 'ui/utils/util';

function uniqKeys(data, name) {
  var out = data.map((item) => item[name]);
  out = out.uniq().sort((a,b) => a.localeCompare(b, 'en', {sensitivity: 'base'}));
  out.unshift('all');
  return out;
}

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  cache: null,

  queryParams: {
    category: {
      refreshModel: true
    },
    catalogId: {
      refreshModel: true
    }
  },

  catalogIds: null,

  deactivate() {
    // Clear the cache when leaving the route so that it will be reloaded when you come back.
    this.set('cache', null);
  },

  beforeModel: function() {
    return this.get('store').request({url: `${this.get('app.catalogEndpoint')}/catalogs`}).then((response) => {
      var catalogs = uniqKeys(response, 'id');
      this.set('catalogIds', catalogs);
    });
  },

  model(params) {
    var cache = this.get('cache');

    // If the catalogIds dont match we need to go get the other catalog from the store since we do not cache all catalogs
    if ( cache && cache.catalogId === params.catalogId)
    {
      return filter(cache, params.category, this.get('catalogIds'));
    }

    if (params.catalogId) {
      this.controllerFor('applications-tab.catalog.index').set('selectedCatalog', params.catalogId);
    }

    var version = this.get('settings.rancherVersion');
    var qp = {
      'category_ne': 'system',
    };

    if (params.catalogId !== 'all') {
      qp['catalogId'] = params.catalogId;
    }

    if ( version )
    {
      qp['minimumRancherVersion_lte'] = version;
    }

    var url = addQueryParams(this.get('app.catalogEndpoint')+'/templates', qp);

    return this.get('store').request({url: url}).then((response) => {
      response.catalogId = params.catalogId;
      this.set('cache', response);
      return filter(response, params.category, this.get('catalogIds'));
    });


    function filter(data, category, catalogIds) {
      data = data.sortBy('name');
      var out = Ember.Object.create({
        categories: uniqKeys(data, 'category'),
        catalogIds: catalogIds,
      });

      if ( category === 'all' ) {
        out.set('catalog', data);
      } else {
        out.set('catalog', data.filterBy('category', category));
      }

      return out;
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
