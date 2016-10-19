import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  catalog: Ember.inject.service(),
  settings: Ember.inject.service(),

  catalogController: Ember.inject.controller('catalog-tab'),
  category: Ember.computed.alias('catalogController.category'),
  categories: Ember.computed.alias('model.categories'),
  catalogId: Ember.computed.alias('catalogController.catalogId'),

  parentRoute: 'catalog-tab',
  launchRoute: 'catalog-tab.launch',

  search: '',

  updating: 'no',

  actions: {
    launch(model) {
      this.get('application').setProperties({
        launchCatalog: true,
        originalModel: model,
        stackResource: null,
      });
    },

    update() {
      this.set('updating', 'yes');
      this.get('catalog').refresh().then(() => {
        this.set('updating', 'no');
        this.send('refresh');
      }).catch(() => {
        this.set('updating', 'error');
      });
    }
  },

  init() {
  },

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
