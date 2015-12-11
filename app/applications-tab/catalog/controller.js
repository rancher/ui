import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['category', 'catalogid'],
  category: 'all',
  catalogid: 'library'
});
