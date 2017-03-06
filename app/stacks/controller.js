import Ember from 'ember';
export default Ember.Controller.extend({
  which: 'containers',
  tags: '',
  queryParams: ['which','tags'],
});
