import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['category', 'catalogId','templateBase', 'launchCluster'],
  category: '',
  templateBase: '',
  catalogId: '',
  launchCluster: false
});
