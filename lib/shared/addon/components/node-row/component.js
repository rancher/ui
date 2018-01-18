import { or } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export const headersAll = [
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
    name: 'cluster',
    sort: ['cluster.displayName','name','id'],
    searchField: 'cluster.displayName',
    translationKey: 'nodesPage.table.clusterName',
    views: ['global'],
  },
  {
    name: 'cpu',
    sort: ['cpu','displayName'],
    searchField: null,
    width: 100,
    translationKey: 'nodesPage.table.cpu',
    views: ['cluster','global'],
  },
  {
    name: 'memory',
    sort: ['memory','displayName'],
    searchField: null,
    width: 150,
    translationKey: 'nodesPage.table.memory',
  },
  {
    name: 'pod',
    sort: false,
    searchField: null,
    width: 100,
    translationKey: 'nodesPage.table.pod',
    views: ['cluster','global'],
  },
];

const headersMap = {
  all: headersAll,
  global:  headersAll.filter((x) => !x.views || x.views.includes('global' )),
  cluster: headersAll.filter((x) => !x.views || x.views.includes('cluster')),
};

export const headersCluster = headersMap.cluster;
export const headersGlobal  = headersMap.global;

export default Component.extend({
  layout,
  scope: service(),
  session:  service(),

  view: 'project',
  model: null,
  tagName: '',
  subMatches: null,
  expanded: null,

  showLabelRow: or('model.displayUserLabelStrings.length','model.requireAnyLabelStrings.length'),

  showCluster: computed('view', function() {
    return !!headersMap[get(this,'view')].findBy('name','cluster');
  }),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
