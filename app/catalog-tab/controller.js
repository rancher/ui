import Controller from '@ember/controller';

export default Controller.extend({
  queryParams:      ['category', 'catalogId', 'clusterCatalogId', 'projectCatalogId'],
  category:         '',
  catalogId:        '',
  clusterCatalogId: '',
  projectCatalogId: '',
});
