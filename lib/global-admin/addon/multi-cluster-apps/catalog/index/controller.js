import { alias } from '@ember/object/computed';
import Controller, { inject as controller } from '@ember/controller';
import { isAlternate } from 'ui/utils/platform';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';


export default Controller.extend({
  application:       controller(),
  catalogController: controller('multi-cluster-apps.catalog'),
  parentRoute:       'multi-cluster-apps.catalog',
  launchRoute:       'multi-cluster-apps.catalog.launch',
  category:          alias('catalogController.category'),
  catalogId:         alias('catalogController.catalogId'),

  actions:           {
    filterAction(catalog){
      let out      = {
        catalogId:        '',
        clusterCatalogId: '',
        projectCatalogId: '',
      };
      let scope    = get(catalog, 'scope');
      let scopedId = `${ scope }Id`;

      out[scopedId] = get(catalog, 'catalogId');

      this.transitionToRoute(this.get('parentRoute'), { queryParams: out });
    },

    categoryAction(category, catalogId){
      this.transitionToRoute(this.get('parentRoute'), {
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
