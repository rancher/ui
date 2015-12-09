import Ember from 'ember';
import { addQueryParams } from 'ui/utils/util';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

  cache: null,

  queryParams: {
    category: {
      refreshModel: true
    }
  },

  deactivate() {
    // Clear the cache when leaving the route so that it will be reloaded when you come back.
    this.set('cache', null);
  },

  model(params) {
    var cache = this.get('cache');
    if ( cache )
    {
      return filter(cache, params.category);
    }

    var version = this.get('settings.rancherVersion');
    var qp = {
      'category_ne': 'system',
    };

    if ( version )
    {
      qp['minimumRancherVersion_lte'] = version;
    }

    var url = addQueryParams(this.get('app.catalogEndpoint')+'/templates', qp);

    return this.get('store').request({url: url}).then((response) => {
      this.set('cache', response);
      return filter(response, params.category);
    });

    function filter(data, category) {
      data = data.sortBy('name');
      var out = Ember.Object.create({
        categories: categories(data),

      });

      if ( category === 'all' ) {
        out.set('catalog', data);
      } else {
        out.set('catalog', data.filterBy('category', category));
      }

      return out;
    }

    function categories(data) {
      var out = data.map((item) => item.category);
      out = out.uniq().sort((a,b) => a.localeCompare(b, 'en', {sensitivity: 'base'}));
      out.unshift('all');
      return out;
    }
  },
});
