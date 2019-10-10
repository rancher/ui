import { alias } from '@ember/object/computed';
import Controller, { inject as controller } from '@ember/controller';
import { isAlternate } from 'ui/utils/platform';
import { getOwner } from '@ember/application';

export default Controller.extend({
  application:       controller(),
  catalogController: controller('multi-cluster-apps.catalog'),
  parentRoute:       'multi-cluster-apps.catalog',
  launchRoute:       'multi-cluster-apps.catalog.launch',
  category:          alias('catalogController.category'),

  actions:           {
    categoryAction(category){
      this.transitionToRoute(this.get('parentRoute'), { queryParams: { category } });
    },

    launch(id, onlyAlternate) {
      if ( onlyAlternate && !isAlternate(event) ) {
        return false;
      }

      this.transitionToRoute(this.get('launchRoute'), id);
    },

    refresh() {
      let catalogTab = getOwner(this).lookup('route:multi-cluster-apps.catalog');

      catalogTab.send('refresh');
    },
  }
});
