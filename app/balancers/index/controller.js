import Ember from 'ember';
import { searchFields as containerSearchFields } from 'ui/components/container-dots/component';
import { headers } from 'ui/containers/index/controller';

export default Ember.Controller.extend({
  projectController: Ember.inject.controller('authenticated.project'),
  projects: Ember.inject.service(),

  tags: Ember.computed.alias('projectController.tags'),
  simpleMode: Ember.computed.alias('projectController.simpleMode'),
  group: Ember.computed.alias('projectController.group'),
  groupTableBy: Ember.computed.alias('projectController.groupTableBy'),
  showStack: Ember.computed.alias('projectController.showStack'),
  expandedInstances: Ember.computed.alias('projectController.expandedInstances'),
  preSorts: Ember.computed.alias('projectController.preSorts'),

  queryParams: ['sortBy'],
  sortBy: 'name',

  actions: {
    toggleExpand() {
      this.get('projectController').send('toggleExpand', ...arguments);
    },
  },

  extraSearchFields: ['id:prefix','displayIp:ip'],
  extraSearchSubFields: containerSearchFields,
  headers: headers,

  rows: function() {
    let showStack = this.get('showStack');
    let services = this.get('model.services').filter((obj) => {
      return showStack[obj.get('stackId')] && obj.get('isBalancer');
    });

    if ( this.get('group') === 'none' ) {
      let out = []
      services.forEach((obj) => {
        out.pushObjects(obj.get('instances'));
      });

      return out;
    } else {
      return services;
    }
  }.property('group','showStack','model.services.@each.{isBalancer,instances}'),
});
