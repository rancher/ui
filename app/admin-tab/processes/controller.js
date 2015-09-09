import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['showRunning', 'resourceId', 'resourceType', 'processName'],
  showRunning: false,
  resourceId: null,
  resourceType: null,
  processName: null
});
