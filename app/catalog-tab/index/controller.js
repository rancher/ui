import { alias } from '@ember/object/computed';
import Controller, { inject as controller } from '@ember/controller';
import { isAlternate } from 'ui/utils/platform';
import { getOwner } from '@ember/application';

export default Controller.extend({
  application:       controller(),
  catalogController: controller('catalog-tab'),
  category:          alias('catalogController.category'),
  catalogId:         alias('catalogController.catalogId'),
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
    refresh() {
      let catalogTab = getOwner(this).lookup('route:catalog-tab');
      catalogTab.send('refresh');
    },

  }
});
