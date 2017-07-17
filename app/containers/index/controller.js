import Ember from 'ember';
import C from 'ui/utils/constants';
import { searchFields as containerSearchFields } from 'ui/components/container-dots/component';

export const headers = [
  {
    name: 'expand',
    sort: false,
    searchField: null,
    width: 30
  },
  {
    name: 'state',
    sort: ['stateSort','displayName'],
    searchField: 'displayState',
    translationKey: 'generic.state',
    width: 120
  },
  {
    name: 'name',
    sort: ['displayName','id'],
    searchField: 'displayName',
    translationKey: 'generic.name',
  },
  {
    name: 'image',
    sort: ['displayImage','displayName'],
    searchField: 'displayImage',
    translationKey: 'generic.image',
  },
  {
    name: 'scale',
    sort: ['scale:desc','isGlobalScale:desc'],
    searchField: null,
    translationKey: 'stacksPage.table.scale',
    classNames: 'text-center',
    width: 100
  },
];

export default Ember.Controller.extend({
  projectController: Ember.inject.controller('authenticated.project'),
  projects: Ember.inject.service(),

  queryParams: ['sortBy'],
  sortBy: 'name',

  actions: {
    toggleExpand() {
      this.get('projectController').send('toggleExpand', ...arguments);
    },
  },

  tags: Ember.computed.alias('projectController.tags'),
  simpleMode: Ember.computed.alias('projectController.simpleMode'),
  groupBy: Ember.computed.alias('projectController.groupBy'),
  showStack: Ember.computed.alias('projectController.showStack'),
  emptyStacks: Ember.computed.alias('projectController.emptyStacks'),
  expandedInstances: Ember.computed.alias('projectController.expandedInstances'),
  preSorts: Ember.computed.alias('projectController.preSorts'),

  headers: headers,
  extraSearchFields: ['id:prefix','displayIp:ip'],
  extraSearchSubFields: containerSearchFields,

  rows: function() {
    let showStack = this.get('showStack');

    // Services
    let out = this.get('model.services').filter((obj) => {
      return showStack[obj.get('stackId')] && obj.get('isReal') && !obj.get('isBalancer');
    });

    // Containers
    if ( !this.get('tags') ) {
      out.pushObjects(this.get('model.instances').filterBy('serviceId',null).filter((obj) => {
        return showStack[obj.get('stackId')];
      }));
    }

    return out;
  }.property('showStack','tags','model.services.@each.{isReal,isBalancer}','standaloneContainers.[]'),

  showWelcome: function() {
    return this.get('projects.current.orchestration') === 'cattle' && !this.get('rows.length');
  }.property('filtered.length','projects.current.orchestration'),

  showOrchestration: function() {
    return false && this.get('app.mode') !== C.MODE.CAAS;
  }.property('app.mode'),
});
