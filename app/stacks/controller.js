import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  which: C.EXTERNAL_ID.KIND_ALL,
  tags: '',
  queryParams: ['which','tags'],
});
