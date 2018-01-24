import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
  projectController: controller('authenticated.project'),
  scope:             service(),

  tags:              alias('projectController.tags'),
  simpleMode:        alias('projectController.simpleMode'),
  groupTableBy:      alias('projectController.groupTableBy'),
  showNamespace:     alias('projectController.showNamespace'),
  expandedInstances: alias('projectController.expandedInstances'),
  preSorts:          alias('projectController.preSorts'),

  queryParams:       ['sortBy'],
  sortBy:            'name',

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
      sort: ['sortState','displayName'],
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
    let showNamespace = this.get('showNamespace');

    // VolumeTemplates
    let out = (this.get('model.volumeTemplates')||[]).slice().filter((obj) => {
      return showNamespace[obj.get('stackId')];
    });

    if ( !this.get('tags') ) {
      out.pushObjects((this.get('model.volumes')||[]).filterBy('volumeTemplateId',null).filter((obj) => {
        let stackId = obj.get('stackId');
        return !stackId || showNamespace[stackId];
      }));
    }

    return out;
  }.property('showNamespace','tags','model.volumeTemplates.@each.stackId','model.volumes.@each.{stackId,volumeTemplateId}'),
});
