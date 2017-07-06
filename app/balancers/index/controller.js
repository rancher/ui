import Ember from 'ember';
import { searchFields as containerSearchFields } from 'ui/components/container-dots/component';
import { headers } from 'ui/containers/index/controller';

export default Ember.Controller.extend({
  projectController: Ember.inject.controller('authenticated.project'),
  projects: Ember.inject.service(),

  tags: Ember.computed.alias('projectController.tags'),
  simpleMode: Ember.computed.alias('projectController.simpleMode'),
  groupBy: Ember.computed.alias('projectController.groupBy'),
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

    let out = this.get('model.services').filter((obj) => {
      return showStack[obj.get('stackId')] && obj.get('isBalancer');
    });

    return out;
  }.property('showStack','model.services.@each.{isBalancer}'),
});
