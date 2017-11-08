import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import {
  searchFields as containerSearchFields
} from 'shared/components/container-dots/component';

export const headers = [
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
    sort: ['sortName','id'],
    searchField: 'displayName',
    translationKey: 'generic.name',
  },
  {
    name: 'image',
    sort: ['image','displayName'],
    searchField: 'image',
    translationKey: 'generic.image',
  },
  {
    name: 'scale',
    sort: ['scale:desc','isGlobalScale:desc','displayName'],
    searchField: null,
    translationKey: 'stacksPage.table.scale',
    classNames: 'text-center',
    width: 100
  },
];

export default Controller.extend({
  projectController: controller('authenticated.project'),
  projects: service(),
  prefs: service(),

  queryParams: ['sortBy'],
  sortBy: 'name',

  actions: {
    toggleExpand() {
      this.get('projectController').send('toggleExpand', ...arguments);
    },
  },

  tags: alias('projectController.tags'),
  simpleMode: alias('projectController.simpleMode'),
  group: alias('projectController.group'),
  groupTableBy: alias('projectController.groupTableBy'),
  showStack: alias('projectController.showStack'),
  emptyStacks: alias('projectController.emptyStacks'),
  expandedInstances: alias('projectController.expandedInstances'),
  preSorts: alias('projectController.preSorts'),

  headers: headers,
  extraSearchFields: ['id:prefix','displayIp:ip'],
  extraSearchSubFields: containerSearchFields,

  rows: function() {
    let groupNone = this.get('group') === 'none';
    let showStack = this.get('showStack');
    let showSystem = this.get('prefs.showSystemResources');

    // Containers
    let out = this.get('model.instances').filter((obj) => {
      return (groupNone || obj.get('serviceId') === null) &&
              showStack[obj.get('stackId')] &&
              (showSystem || obj.get('isSystem') !== true); // Note that it can be null, so this isn't the same as === false
    });

    // Services
    if ( !groupNone ) {
      out.pushObjects(this.get('model.services').filter((obj) => {
        return showStack[obj.get('stackId')] &&
                obj.get('isReal') && !obj.get('isBalancer') &&
                (showSystem || obj.get('isSystem') !== true); // Note that it can be null, so this isn't the same as === false
      }));
    }

    return out;
  }.property('group','showStack','tags','model.services.@each.{stackId,isReal,isBalancer,isSystem}','model.instances.@each.{serviceId,stackId,isSystem}','prefs.showSystemResources'),
});
