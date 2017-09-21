import Ember from 'ember';
import { isAlternate } from 'ui/utils/platform';

export default Ember.Controller.extend({
  application:       Ember.inject.controller(),
  catalogController: Ember.inject.controller('catalog-tab'),
  category:          Ember.computed.alias('catalogController.category'),
  catalogId:         Ember.computed.alias('catalogController.catalogId'),
  parentRoute:       'catalog-tab',
  launchRoute:       'catalog-tab.launch',
  actions: {
    filterAction: function(catalogId){
      this.transitionToRoute(this.get('parentRoute'), {queryParams: {catalogId: catalogId}});
    },
    categoryAction: function(category, catalogId){
      this.transitionToRoute(this.get('launchRoute'), {queryParams: {category: category, catalogId: catalogId}});
    },
    launch(id, onlyAlternate) {
      if ( onlyAlternate && !isAlternate(event) ) {
        return false;
      }

      this.transitionToRoute(this.get('launchRoute'), id);
    },

  }
});
