import Ember from 'ember';
export default Ember.Controller.extend({
  which: 'user',
  tags: '',
  queryParams: ['which','tags'],
});
