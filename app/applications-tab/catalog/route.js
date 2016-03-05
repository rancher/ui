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
  projects: Ember.inject.service(),

  templateBase: function() {
    if ( this.get('projects.current.kubernetes') ) {
      return 'kubernetes';
    } else if ( this.get('projects.current.swarm') ) {
      return 'swarm';
    } else {
      return 'cattle';
    }
  }.property('projects.current.{swarm,kubernetes}'),

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
    var templateBase = this.get('templateBase');

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
      data = data.filterBy('templateBase', (templateBase === 'cattle' ? '' : templateBase));

      if ( category !== 'all' ) {
        data = data.filterBy('category', category);
      }

      data = data.sortBy('name');

      return Ember.Object.create({
        categories: uniqKeys(data, 'category'),
        catalogIds: catalogIds,
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
