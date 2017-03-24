import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams : ['backTo', 'driver', 'hostId'],
  backTo      : null,
  driver      : null,
  hostId      : null,
  actions: {
    completed() {}
  }
});
