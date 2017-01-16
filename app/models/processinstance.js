import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var ProcessInstance = Resource.extend({
  runTime: Ember.computed('startTime', 'endTime', function(){
    return moment(this.get('endTime')).diff(this.get('startTime'), 'seconds');
  }),

  typeAndId: Ember.computed('resourceType','resourceId', function() {
    return this.get('resourceType') + ':' + this.get('resourceId');
  }),
});

export default ProcessInstance;
