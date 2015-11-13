import Ember from 'ember';

export default Ember.Route.extend({
  settings: Ember.inject.service(),

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

    var url = this.get('app.catalogEndpoint')+'/templates';
    var version = this.get('settings.rancherVersion');
    if ( version )
    {
      url += '?minimumRancherVersion_lte=' + encodeURIComponent(version);
    }

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
