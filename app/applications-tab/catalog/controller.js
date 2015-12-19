import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['category', 'catalogId'],
  category: 'all',
  catalogId: 'all'
});
