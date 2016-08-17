import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  catalogService: Ember.inject.service('catalog-service'),

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
      this.get('catalogService').refresh().then(() => {
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

  arrangedContent: Ember.computed('model.catalog', 'search', function() {
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
  }),
});
