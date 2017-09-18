import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['category', 'catalogId','templateBase', 'launchCluster'],
  category: 'all',
  templateBase: '',
  catalogId: 'all',
  launchCluster: false
});
