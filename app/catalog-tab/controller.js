import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['category', 'catalogId','templateBase'],
  category: 'all',
  templateBase: '',
  catalogId: 'all'
});
