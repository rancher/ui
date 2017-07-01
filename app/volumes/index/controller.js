import Ember from 'ember';
import { tagsToArray } from 'ui/models/stack';
import { headersWithHost as containerHeaders } from 'ui/components/container-table/component';

export default Ember.Controller.extend({
  projectController: Ember.inject.controller('authenticated.project'),
  projects: Ember.inject.service(),
  prefs: Ember.inject.service(),
  intl: Ember.inject.service(),

  tags: Ember.computed.alias('projectController.tags'),
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
      name: 'scope',
      sort: ['stack.isDefault:desc','stack.displayName','scope'],
      translationKey: 'volumesPage.scope.label',
      width: 120
    },
    {
      name: 'driver',
      sort: ['stack.isDefault:desc','stack.displayName','driver','displayName','id'],
      searchField: 'displayType',
      translationKey: 'volumesPage.driver.label',
      width: 150
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

    return out;
  }.property('model.stacks.@each.{grouping,system}','tags','prefs.showSystemResources'),

  combinedInstances: function() {
    let out = this.get('model.volumeTemplates').slice();
    out.pushObjects(this.get('model.volumes').filterBy('volumeTemplateId',null));
    return out;
  }.property('model.volumeTemplates.[]','model.volumes.@each.volumeTemplateId'),

  simpleMode: function() {
    let all = this.get('filteredStacks');
    if ( all.get('length') > 1 ) {
      return false;
    }

    let stack = all.objectAt(0);
    if ( stack.get('isDefault') ) {
      return true;
    }

    return false;
  }.property('filteredStacks.@each.name'),
});
