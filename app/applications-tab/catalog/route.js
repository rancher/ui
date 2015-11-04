import Ember from 'ember';

export default Ember.Route.extend({
  cache: null,

  queryParams: {
    category: {
      refreshModel: true
    }
  },

  model: function(params) {
    var cache = this.get('cache');
    if ( cache )
    {
      return filter(cache, params.category);
    }

    return Ember.$.ajax(this.get('app.catalogEndpoint')+'/templates', 'GET').then((response) => {
      this.set('cache', response.data);
      return filter(response.data, params.category);
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
