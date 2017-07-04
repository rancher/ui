import Ember from 'ember';
import { tagsToArray } from 'ui/models/stack';
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
  prefs: Ember.inject.service(),
  intl: Ember.inject.service(),

  queryParams: ['sortBy','mode','showServices'],
  mode: 'grouped',
  sortBy: 'name',
  tags: Ember.computed.alias('projectController.tags'),

  expandedInstances: null,

  _allStacks: null,

  init() {
    this._super(...arguments);
    this.set('_allStacks', this.get('store').all('stack'));
    this.set('expandedInstances',[]);
  },

  actions: {
    toggleExpand(instId) {
      let list = this.get('expandedInstances');
      if ( list.includes(instId) ) {
        list.removeObject(instId);
      } else {
        list.addObject(instId);
      }
    },
  },

  preSorts: ['stack.isDefault:desc','stack.displayName'],
  headers: headers,
  extraSearchFields: ['id:prefix','displayIp:ip'],
  extraSearchSubFields: containerSearchFields,

  showStack: function() {
    var needTags = tagsToArray(this.get('tags'));

    let out = {};
    let ok;
    this.get('model.stacks').forEach((obj) => {
      ok = true;
      if ( !this.get('prefs.showSystemResources') && obj.get('system') !== false ) {
        ok = false;
      }

      if ( ok && !obj.hasTags(needTags) ) {
        ok = false;
      }

      if ( ok && obj.get('type').toLowerCase() === 'kubernetesstack' ) {
        ok = false;
      }

      out[obj.get('id')] = ok;
    });

    return out;
  }.property('model.stacks.@each.{grouping,system}','tags','prefs.showSystemResources'), // Grouping is used for tags

  rows: function() {
    let showStack = this.get('showStack');

    let stackId;
    // Containers
    let out = this.get('model.instances').filterBy('serviceId',null).filter((obj) => {
      stackId = obj.get('stackId');
      return showStack[obj.get('stackId')];
    });

    // Services
    out.pushObjects(this.get('model.services').filter((obj) => {
      stackId = obj.get('stackId');
      return showStack[stackId] && obj.get('isReal') && !obj.get('isBalancer');
    }));

    return out;
  }.property('showStack','model.services.@each.{isReal,isBalancer}','standaloneContainers.[]'),

  emptyStacks: function() {
    return this.get('model.stacks').filterBy('isEmpty',true).map((x) => { return {ref: x} });
  }.property('model.stacks.@each.isEmpty'),

  groupBy: function() {
    if ( !this.get('simpleMode') && this.get('mode') === 'grouped' ) {
      return 'stack.id';
    } else {
      return null;
    }
  }.property('simpleMode', 'mode'),

  simpleMode: function() {
    let list = this.get('_allStacks');
    if ( !this.get('prefs.showSystemResources') ) {
      list = list.filterBy('system', false);
    }

    let bad = list.findBy('isDefault', false);
    return !bad;
  }.property('_allStacks.@each.{system,isDefault}','prefs.showSystemResources'),

  showWelcome: function() {
    return this.get('projects.current.orchestration') === 'cattle' && !this.get('rows.length');
  }.property('filtered.length','projects.current.orchestration'),

  showOrchestration: function() {
    return this.get('app.mode') !== C.MODE.CAAS;
  }.property('app.mode'),

});
