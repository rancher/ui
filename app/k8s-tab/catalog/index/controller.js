import Ember from 'ember';
import CatalogIndexController from 'ui/applications-tab/catalog/index/controller';

export default CatalogIndexController.extend({
  catalogController: Ember.inject.controller('k8s-tab.catalog'),
  parentRoute: 'k8s-tab.catalog',
  launchRoute: 'k8s-tab.catalog.launch',
});
