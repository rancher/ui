import Ember from 'ember';
import C from 'ui/utils/constants';
import { tagsToArray } from 'ui/models/stack';
import { headersWithHost as containerHeaders } from 'ui/components/container-table/component';

export default Ember.Controller.extend({
  stacksController: Ember.inject.controller('stacks'),
  projects: Ember.inject.service(),
  prefs: Ember.inject.service(),
  intl: Ember.inject.service(),

  which: Ember.computed.alias('stacksController.which'),
  tags: Ember.computed.alias('stacksController.tags'),
  sortBy: 'name',

  expandedInstances: null,

  init() {
    this._super(...arguments);
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
  headers: [
    {
      name: 'expand',
      sort: false,
      searchField: null,
      width: 30
    },
    {
      name: 'state',
      sort: ['stack.isDefault:desc','stack.displayName','stateSort','displayName'],
      searchField: 'displayState',
      translationKey: 'generic.state',
      width: 120
    },
    {
      name: 'name',
      sort: ['stack.isDefault:desc','stack.displayName','displayName','id'],
      searchField: 'displayName',
      translationKey: 'generic.name',
    },
    {
      name: 'endpoints',
      sort: null,
      searchField: 'endpointPorts',
      translationKey: 'stacksPage.table.endpoints',
    },
    {
      name: 'image',
      sort: ['stack.isDefault:desc','stack.displayName','displayImage','displayName'],
      searchField: 'displayImage',
      translationKey: 'generic.image',
    },
    {
      name: 'instanceCount',
      sort: ['stack.isDefault:desc','stack.displayName','instanceCount:desc','displayName'],
      searchField: null,
      width: 80,
      icon: 'icon icon-lg icon-container',
      dtTranslationKey: 'stacksPage.table.instanceCount'
    },
    {
      name: 'instanceState',
      sort: ['stack.isDefault:desc','stack.displayName', 'instanceCountSort:desc','displayName'],
      searchField: null,
      width: 100,
      icon: 'icon icon-lg icon-container',
      dtTranslationKey: 'stacksPage.table.instanceState',
      translationKey: 'stacksPage.table.instanceStateWithIcon',
    },
    {
      isActions: true,
      width: 30,
    },
  ],

  filteredStacks: function() {
    var which = this.get('which');
    var needTags = tagsToArray(this.get('tags'));
    var out = this.get('model.stacks');

    if ( !this.get('prefs.showSystemResources') ) {
      out = out.filterBy('system', false);
    }

    if ( which === C.EXTERNAL_ID.KIND_NOT_ORCHESTRATION )
    {
      out = out.filter(function(obj) {
        return C.EXTERNAL_ID.KIND_ORCHESTRATION.indexOf(obj.get('grouping')) === -1;
      });
    }
    else if ( which !== C.EXTERNAL_ID.KIND_ALL )
    {
      out = out.filterBy('grouping', which);
    }

    if ( needTags.length ) {
      out = out.filter((obj) => obj.hasTags(needTags));
    }

    out = out.filter((obj) => obj.get('type').toLowerCase() !== 'kubernetesstack');

    return out;

  }.property('model.stacks.@each.{grouping,system}','which','tags','prefs.showSystemResources'),

  combinedInstances: function() {
    let out = [];
    this.get('filteredStacks').forEach((stack) => {
      out.pushObjects(stack.get('services').filterBy('isReal', true));
    });

    return out;
  }.property('filteredStacks.@each.services'),

  simpleMode: function() {
    if ( this.get('which') !== C.EXTERNAL_ID.KIND_ALL ) {
      return false;
    }

    let all = this.get('filteredStacks');
    if ( all.get('length') > 1 ) {
      return false;
    }

    let stack = all.objectAt(0);
    if ( stack.get('isDefault') ) {
      return true;
    }

    return false;
  }.property('which','filteredStacks.@each.name'),

  pageHeader: function() {
    let which = this.get('which');
    let tags = this.get('tags');

    if ( tags && tags.length ) {
      return 'stacksPage.header.tags';
    } else if ( which === C.EXTERNAL_ID.KIND_ALL ) {
      return 'stacksPage.header.containers';
    } else if ( C.EXTERNAL_ID.SHOW_AS_SYSTEM.indexOf(which) >= 0 ) {
      return 'stacksPage.header.infra';
    } else if ( which.toLowerCase() === 'user') {
      return 'stacksPage.header.user';
    } else {
      return 'stacksPage.header.custom';
    }
  }.property('which','tags'),
});
