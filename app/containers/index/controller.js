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
  scope: service(),
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
  showNamespace: alias('projectController.showNamespace'),
  emptyNamespaces: alias('projectController.emptyNamespaces'),
  expandedInstances: alias('projectController.expandedInstances'),
  preSorts: alias('projectController.preSorts'),

  headers: headers,
  extraSearchFields: ['id:prefix','displayIp:ip'],
  extraSearchSubFields: containerSearchFields,

  rows: function() {
    let groupNone = this.get('group') === 'none';
    let showNamespace = this.get('showNamespace');

    // Containers
    let out = this.get('model.pods').filter((obj) => {
      return (groupNone || !obj.get('workloadId')) &&
              showNamespace[obj.get('namespaceId')];
    });

    // Services
    if ( !groupNone ) {
      out.pushObjects(this.get('model.workloads').filter((obj) => {
        return showNamespace[obj.get('namespaceId')] &&
                !obj.get('isBalancer');
      }));
    }

    return out;
  }.property('group','showNamespace','tags','model.workloads.@each.{namespaceId,isBalancer}','model.pods.@each.{workloadId,namespaceId}'),
});
