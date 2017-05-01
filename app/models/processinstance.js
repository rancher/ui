import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var ProcessInstance = Resource.extend({
  runTime: Ember.computed('startTime', 'endTime', function(){
    return moment(this.get('endTime')).diff(this.get('startTime'), 'seconds');
  }),

  typeAndId: Ember.computed('resourceType','resourceId', function() {
    return this.get('resourceType') + ':' + this.get('resourceId');
  }),

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'action.replay',    icon: 'icon icon-refresh',      action: 'replay',  enabled: !!a.replay },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link',action: 'goToApi', enabled: true },
    ];
  }.property('actionLinks.replay'),
});

export default ProcessInstance;
