import { alias } from '@ember/object/computed';
import Controller, { inject as controller } from '@ember/controller';
import { isAlternate } from 'ui/utils/platform';
import { getOwner } from '@ember/application';
import { get, computed } from '@ember/object';


export default Controller.extend({
  application:       controller(),
  catalogController: controller('catalog-tab'),
  queryParams:       ['istio'],
  parentRoute:       'catalog-tab',
  launchRoute:       'catalog-tab.launch',
  istio:             false,

  category:          alias('catalogController.category'),
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

  catalogId: computed('catalogController.catalogId', 'catalogController.clusterCatalogId', 'catalogController.projectCatalogId', function() {
    const clusterCatalogId = get(this, 'catalogController.clusterCatalogId')
    const projectCatalogId = get(this, 'catalogController.projectCatalogId')
    const catalogId = get(this, 'catalogController.catalogId')
    let out = ''

    if (catalogId) {
      out = catalogId
    }
    if (clusterCatalogId) {
      out = clusterCatalogId.split(':')[1]
    }
    if (projectCatalogId) {
      out = projectCatalogId.split(':')[1]
    }

    return out
  }),

});
