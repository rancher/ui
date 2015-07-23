import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['timedOut','errorMsg'],

  timedOut: false,
  waiting: false,
  errorMsg: null,
});
