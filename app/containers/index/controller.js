import Ember from 'ember';
import { tagsToArray } from 'ui/models/stack';
import { headersWithHost as containerHeaders } from 'ui/components/container-table/component';
import C from 'ui/utils/constants';

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

  containerHeaders: containerHeaders,
  preSorts: ['stack.isDefault:desc','stack.displayName'],
  headers: [
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
  ],

  filteredStacks: function() {
    var needTags = tagsToArray(this.get('tags'));
    var out = this.get('model.stacks');

    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('system', false);
    }

    if ( needTags.length ) {
      out = out.filter((obj) => obj.hasTags(needTags));
    }

    out = out.filter((obj) => obj.get('type').toLowerCase() !== 'kubernetesstack');

    return out;

  }.property('model.stacks.@each.{grouping,system}','tags','prefs.showSystemResources'),

  standaloneContainers: function() {
    return this.get('model.instances').filterBy('serviceId',null);
  }.property('model.instances.@each.serviceId'),

  rows: function() {
    let out = [];
    this.get('filteredStacks').forEach((stack) => {
      out.pushObjects(stack.get('services').filter((x) => x.get('isReal') && !x.get('isBalancer')));
    });

    out.pushObjects(this.get('standaloneContainers'));

    return out;
  }.property('filteredStacks.@each.services','standaloneContainers.[]'),

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
