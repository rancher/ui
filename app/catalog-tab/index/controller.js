import { alias } from '@ember/object/computed';
import Controller, { inject as controller } from '@ember/controller';
import { isAlternate } from 'ui/utils/platform';
import { getOwner } from '@ember/application';

export default Controller.extend({
  application:       controller(),
  catalogController: controller('catalog-tab'),
  parentRoute:       'catalog-tab',
  launchRoute:       'catalog-tab.launch',
  category:          alias('catalogController.category'),
  catalogId:         alias('catalogController.catalogId'),
  actions:           {
    filterAction(catalogId){

      this.transitionToRoute(this.get('parentRoute'), { queryParams: { catalogId } });

    },
    categoryAction(category, catalogId){

      this.transitionToRoute(this.get('launchRoute'), {
        queryParams: {
          category,
          catalogId
        }
      });

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
