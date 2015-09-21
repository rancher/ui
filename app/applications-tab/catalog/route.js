import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return Ember.$.ajax('/v1-catalog/templates', 'GET').then((response) => {
      var data = response.data.sortBy('name');
      var responseData  = Ember.Object.create({
          categories: this.buildCategories(response.data)
        });
      if (params.type === 'all') {
        responseData.set('catalog', data);
      } else {
        responseData.set('catalog', _.where(data, {category: params.type}));
      }
      return responseData;
    }, function(/*error*/){});
  },
  buildCategories: function(categories) {
    var catArr = ['all'];
    _.each(categories, (catalogItem) => {
      catArr.push(catalogItem.category);
    });
    return _.sortBy(catArr, function(i){ return i.toLowerCase();});
  }
});
