import Ember from 'ember';

export default Ember.Controller.extend({
  settings    : Ember.inject.service(),
  queryParams : ['backToAdd'],
  backToAdd   : false,
  errors      : null,
  editing     : true,
  saving      : false,
});
