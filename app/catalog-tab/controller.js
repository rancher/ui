import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['category', 'catalogId','templateBase', 'launchCluster'],
  category: 'all',
  templateBase: '',
  catalogId: 'all',
  launchCluster: false
});
