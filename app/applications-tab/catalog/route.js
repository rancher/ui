import Ember from 'ember';

export default Ember.Route.extend({
  cache: null,
  model: function(params) {
    var cache = this.get('cache');
    if ( cache )
    {
      return filter(cache, params.type);
    }

    return Ember.$.ajax('/v1-catalog/templates', 'GET').then((response) => {
      this.set('cache', response.data);
      return filter(response.data, params.type);
    });

    function filter(data, type) {
      data = data.sortBy('name');
      var out = Ember.Object.create({
        categories: categories(data),

      });

      if ( type === 'all' ) {
        out.set('catalog', data);
      } else {
        out.set('catalog', data.filterBy('category', type));
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
