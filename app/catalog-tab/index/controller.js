import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),

  catalogController: Ember.inject.controller('catalog-tab'),
  category: Ember.computed.alias('catalogController.category'),
  selectedCatalog: Ember.computed.alias('catalogController.catalogId'),
  categories: Ember.computed.alias('model.categories'),
  catalogIds: Ember.computed.alias('model.catalogIds'),

  parentRoute: 'catalog-tab',
  launchRoute: 'catalog-tab.launch',

  // > 2 because 'all' is one of them.
  showCatalogDropdown: Ember.computed.gt('catalogIds.length',2),

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
