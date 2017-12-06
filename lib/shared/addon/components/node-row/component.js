import { or, equal, not, alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'

export const headersAll = [
  {
    name: 'expand',
    sort: false,
    searchField: null,
    width: 30,
    views: ['project'],
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
    name: 'ip',
    sort: ['displayIp','displayName'],
    searchField: 'displayIp',
    translationKey: 'generic.ipAddress',
    width: 130,
  },
  {
    name: 'cpu',
    sort: ['cpu','displayName'],
    searchField: 'cpuBlurb',
    width: 80,
    translationKey: 'nodesPage.table.cpu',
    views: ['cluster','global'],
  },
  {
    name: 'memory',
    sort: ['memory','displayName'],
    searchField: 'memoryBlurb',
    width: 80,
    translationKey: 'nodesPage.table.memory',
  },
  {
    name: 'disk',
    sort: false,
    searchField: 'diskBlurb',
    width: 80,
    translationKey: 'nodesPage.table.disk',
    views: ['cluster','global'],
  },
  {
    name: 'docker',
    sort: ['dockerEngineVersion','displayName'],
    searchField: 'dockerEngineVersion',
    width: 110,
    translationKey: 'nodesPage.table.docker',
  },
  {
    name: 'instanceState',
    sort: ['instanceCountSort:desc','displayName'],
    searchField: null,
    width: 140,
    icon: 'icon icon-lg icon-container',
    dtTranslationKey: 'nodesPage.table.instanceState',
    translationKey: 'nodesPage.table.instanceStateWithIcon',
    views: ['project'],
  },
];

export const headersProject = headersAll.filter((x) => !x.views || x.views.includes('project'));
export const headersCluster = headersAll.filter((x) => !x.views || x.views.includes('cluster'));
export const headersGlobal  = headersAll.filter((x) => !x.views || x.views.includes('global' ));

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

  isGlobal:  equal('view', 'global'),
  isCluster: equal('view','cluster'),
  isProject: equal('view','project'),

  showExpand: alias('isProject'),
  linkName: alias('isProject'),
  showInstanceStates: alias('isProject'),
  showCpu: not('isProject'),
  showDisk: not('isProject'),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
