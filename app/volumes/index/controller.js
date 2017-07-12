import Ember from 'ember';

export default Ember.Controller.extend({
  projectController: Ember.inject.controller('authenticated.project'),
  projects: Ember.inject.service(),

  tags: Ember.computed.alias('projectController.tags'),
  simpleMode: Ember.computed.alias('projectController.simpleMode'),
  groupBy: Ember.computed.alias('projectController.groupBy'),
  showStack: Ember.computed.alias('projectController.showStack'),
  emptyStacks: Ember.computed.alias('projectController.emptyStacks'),
  expandedInstances: Ember.computed.alias('projectController.expandedInstances'),
  preSorts: Ember.computed.alias('projectController.preSorts'),

  queryParams: ['sortBy'],
  sortBy: 'name',

  actions: {
    toggleExpand() {
      this.get('projectController').send('toggleExpand', ...arguments);
    },
  },

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
      name: 'mounts',
      sort: ['mounts.length','displayName','id'],
      translationKey: 'volumesPage.mounts.label',
      searchField: null,
      width: 100,
    },
    {
      name: 'scope',
      sort: ['scope'],
      translationKey: 'volumesPage.scope.label',
      width: 120
    },
    {
      name: 'driver',
      sort: ['driver','displayName','id'],
      searchField: 'displayType',
      translationKey: 'volumesPage.driver.label',
      width: 150
    },
  ],

  rows: function() {
    let showStack = this.get('showStack');

    // VolumeTemplates
    let out = this.get('model.volumeTemplates').slice().filter((obj) => {
      return showStack[obj.get('stackId')];
    });

    if ( !this.get('tags') ) {
      out.pushObjects(this.get('model.volumes').filterBy('volumeTemplateId',null).filter((obj) => {
        let stackId = obj.get('stackId');
        return !stackId || showStack[stackId];
      }));
    }

    return out;
  }.property('showStack','tags','model.volumeTemplates.@each.stackId','model.volumes.@each.{stackId,volumeTemplateId}'),
});
