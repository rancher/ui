import { or } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export const headersAll = [
  {
    name:           'state',
    sort:           ['sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120
  },
  {
    name:           'name',
    sort:           ['displayName', 'id'],
    searchField:    'displayName',
    translationKey: 'generic.name',
  },
  {
    name:           'cluster',
    sort:           ['cluster.displayName', 'name', 'id'],
    searchField:    'cluster.displayName',
    translationKey: 'nodesPage.table.clusterName',
    views:          ['global'],
  },
  {
    name:           'roles',
    sort:           ['sortRole', 'name', 'id'],
    searchField:    'displayRoles',
    translationKey: 'nodesPage.table.role',
    views:          ['cluster'],
    width:          120,
  },
  {
    name:           'version',
    sort:           ['name', 'id'],
    searchField:    null,
    translationKey: 'nodesPage.table.version',
    views:          ['cluster'],
    width:          120,
  },
  {
    name:           'cpu',
    sort:           ['cpuUsage', 'displayName'],
    searchField:    null,
    width:          100,
    translationKey: 'nodesPage.table.cpu',
    classNames:     ['text-right'],
  },
  {
    name:           'memory',
    sort:           ['memoryUsage', 'displayName'],
    searchField:    null,
    width:          150,
    translationKey: 'nodesPage.table.memory',
    classNames:     ['text-right'],
  },
  {
    name:           'pod',
    sort:           ['podUsage', 'displayName'],
    searchField:    null,
    width:          100,
    translationKey: 'nodesPage.table.pod',
    classNames:     ['text-right'],
  },
];

const headersMap = {
  all:     headersAll,
  global:  headersAll.filter((x) => !x.views || x.views.includes('global' )),
  cluster: headersAll.filter((x) => !x.views || x.views.includes('cluster')),
};

export const headersCluster = headersMap.cluster;
export const headersGlobal  = headersMap.global;

export default Component.extend({
  scope:   service(),
  session:  service(),

  layout,
  view:       'project',
  model:      null,
  tagName:    '',
  subMatches: null,
  expanded:   null,

  showLabelRow: or('model.displayUserLabelStrings.length', 'model.requireAnyLabelStrings.length'),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },

  showCluster: computed('view', function() {
    return !!headersMap[get(this, 'view')].findBy('name', 'cluster');
  }),

  showRoles: computed('view', function() {
    return !!headersMap[get(this, 'view')].findBy('name', 'roles');
  }),

  labelColspan: computed('fullColspan', function() {
    return get(this, 'fullColspan') + 1;
  }),
});
