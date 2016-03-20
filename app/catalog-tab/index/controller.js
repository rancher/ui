import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),

  catalogController: Ember.inject.controller('catalog-tab'),
  category: Ember.computed.alias('catalogController.category'),
  categories: Ember.computed.alias('model.categories'),

  parentRoute: 'catalog-tab',
  launchRoute: 'catalog-tab.launch',

  search: '',

  updating: 'no',

  actions: {
    launch(model) {
      this.get('application').setProperties({
        launchCatalog: true,
        originalModel: model,
        environmentResource: null,
      });
    },

    update() {
      this.set('updating', 'yes');
      this.get('store').request({
        url: `${this.get('app.catalogEndpoint')}/templates?refresh&action=refresh`,
        method: 'POST',
        timeout: null, // I'm willing to wait...
      }).then(() => {
        this.set('updating', 'no');
        this.send('refresh');
      }).catch(() => {
        this.set('updating', 'error');
      });
    }
  },

  selectedCatalog: Ember.computed('catalogController', function() {

    return this.get('catalogController.catalogId');
  }),

  arrangedContent: function() {
    var search = this.get('search').toUpperCase();
    var result = [];

    if (!search) {
      return this.get('model.catalog');
    }

    this.get('model.catalog').forEach((item) => {
      if (item.name.toUpperCase().indexOf(search) >= 0 || item.description.toUpperCase().indexOf(search) >= 0) {
        result.push(item);
      }
    });
    return result;
  }.property('model.catalog', 'search'),
});
