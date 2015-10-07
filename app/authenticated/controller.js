import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  currentPath: Ember.computed.alias('application.currentPath'),
  error: null,
});
