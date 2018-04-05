import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import {
  searchFields as containerSearchFields
} from 'shared/components/pod-dots/component';

const podsHeaders = [
  {
    name: 'expand',
    sort: false,
    searchField: null,
    width: 30
  },
  {
    name: 'state',
    sort: ['sortState', 'displayName'],
    searchField: 'displayState',
    translationKey: 'generic.state',
    width: 120
  },
  {
    name: 'name',
    sort: ['sortName', 'id'],
    searchField: 'displayName',
    translationKey: 'generic.name',
  },
  {
    name: 'image',
    sort: ['image', 'displayName'],
    searchField: 'image',
    translationKey: 'generic.image',
  },
  {
    name: 'scale',
    sort: ['scale:desc', 'isGlobalScale:desc', 'displayName'],
    searchField: null,
    translationKey: 'stacksPage.table.scale',
    classNames: 'text-center',
    width: 100
  },
]

const ingressHeaders = [
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
    name: 'created',
    sort: ['created','id'],
    classNames: 'text-right pr-20',
    searchField: 'created',
    translationKey: 'generic.created',
  },
]

const servicesHeaders = [
  {
    name: 'state',
    sort: ['stack.isDefault:desc','stack.displayName','sortState','displayName'],
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
    name: 'displayType',
    sort: ['displayType','displayName','id'],
    searchField: 'displayType',
    translationKey: 'generic.type',
    width: 150,
  },
  {
    name: 'target',
    sort: false,
    searchField: 'displayTargets',
    translationKey: 'dnsPage.table.target',
  },
]

const volumesHeaders = [
  //    {
  //      name: 'expand',
  //      sort: false,
  //      searchField: null,
  //      width: 30
  //    },
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
    translationKey: 'volumesPage.claimName.label',
  },
  {
    name: 'size',
    sort: ['sizeBytes'],
    search: ['sizeBytes','displaySize'],
    translationKey: 'generic.size',
    width: 120
  },
  {
    name: 'volume',
    sort: ['volume.displayName','displayName','id'],
    translationKey: 'volumesPage.volume.label',
    searchField: null,
  },
  {
    name: 'storageClass',
    sort: ['storageClass.displayName','displayName','id'],
    translationKey: 'volumesPage.storageClass.label',
    searchField: null,
  },
]

const secretsHeaders = [
  {
    name: 'state',
    sort: ['sortState','name','id'],
    type: 'string',
    searchField: 'displayState',
    translationKey: 'generic.state',
    width: 125,
  },
  {
    name: 'name',
    sort: ['name','id'],
    translationKey: 'generic.name',
  },
  {
    name: 'namespace',
    translationKey: 'generic.namespace',
    searchField: 'namespace.displayName',
    sort: ['namespace.displayName','name','id'],
  },
  {
    name: 'keys',
    translationKey: 'secretsPage.table.keys',
    searchField: 'keys',
    sort: ['firstKey','name','id'],
  },
  {
    name: 'created',
    translationKey: 'generic.created',
    sort: ['created:desc','name','id'],
    searchField: false,
    type: 'string',
    width: 150,
  },
]

export default Controller.extend({
  // TODO =- expand logic?
  expandedInstances: [],
  ingressHeaders: ingressHeaders,
  servicesHeaders: servicesHeaders,
  volumesHeaders: volumesHeaders,
  secretsHeaders: secretsHeaders,
  ingressSearchText: '',
  secretsSearchText: '',
  podsHeaders: podsHeaders,
  podsSearchText: '',
  servicesSearchText: '',
  volumesSearchText: '',
  sortBy: 'name',
  extraSearchFields: ['id:prefix', 'displayIp:ip'],
  extraSearchSubFields: containerSearchFields,
  actions: {
    toggleExpand() {
      // ???
    },
  },
  stdOut: computed('model.app.stdOut', function() {
    return get(this, 'model.app.status.stdOutput');
  }),
  stderr: computed('model.app.stdErr', function() {
    return get(this, 'model.app.status.stdError');
  }),

  workloadsAndPods: computed('model.app.workloads', 'model.app.pods', function() {
    let out = [];
    out = this.get('model.app.pods').filter(obj => !obj.get('workloadId'));
    out.pushObjects(this.get('model.app.workloads').slice());
    return out;
  }),
});
