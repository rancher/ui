import { alias } from '@ember/object/computed';
import Controller, { inject as controller } from '@ember/controller';
import { isAlternate } from 'ui/utils/platform';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';


export default Controller.extend({
  application:       controller(),
  catalogController: controller('catalog-tab'),
  queryParams:       ['istio'],
  parentRoute:       'catalog-tab',
  launchRoute:       'catalog-tab.launch',
  istio:             false,

  category:          alias('catalogController.category'),
  actions:           {
    categoryAction(category){
      this.transitionToRoute(this.get('launchRoute'), { queryParams: { category } });
    },

    launch(id, onlyAlternate) {
      if ( onlyAlternate && !isAlternate(event) ) {
        return false;
      }

      if ( get(this, 'istio') ) {
        this.transitionToRoute(this.get('launchRoute'), id, { queryParams: { istio: true,  } });
      } else {
        this.transitionToRoute(this.get('launchRoute'), id);
      }
    },

    refresh() {
      let catalogTab = getOwner(this).lookup('route:catalog-tab');

      catalogTab.send('refresh');
    },
  },
});
