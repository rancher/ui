import Ember from 'ember';

export default Ember.Controller.extend({
  access: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  application: Ember.inject.controller(),
});
