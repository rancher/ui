import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service'
import { computed } from '@ember/object';

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
    translationKey: 'hostsPage.index.table.cpu',
    views: ['cluster'],
  },
  {
    name: 'memory',
    sort: ['memory','displayName'],
    searchField: 'memoryBlurb',
    width: 80,
    translationKey: 'hostsPage.index.table.memory',
  },
  {
    name: 'disk',
    sort: false,
    searchField: 'diskBlurb',
    width: 80,
    translationKey: 'hostsPage.index.table.disk',
    views: ['cluster'],
  },
  {
    name: 'docker',
    sort: ['dockerEngineVersion','displayName'],
    searchField: 'dockerEngineVersion',
    width: 110,
    translationKey: 'hostsPage.index.table.docker',
  },
  {
    name: 'instanceState',
    sort: ['instanceCountSort:desc','displayName'],
    searchField: null,
    width: 140,
    icon: 'icon icon-lg icon-container',
    dtTranslationKey: 'hostsPage.index.table.instanceState',
    translationKey: 'hostsPage.index.table.instanceStateWithIcon',
    views: ['project'],
  },
];

export const headersProject = headersAll.filter((x) => !x.views || x.views.includes('project'));
export const headersCluster = headersAll.filter((x) => !x.views || x.views.includes('cluster'));

export default Component.extend({
  layout,
  projects: service(),
  session:  service(),

  view: 'project',
  model: null,
  tagName: '',
  subMatches: null,
  expanded: null,

  showLabelRow: computed.or('model.displayUserLabelStrings.length','model.requireAnyLabelStrings.length'),

  isCluster: computed.equal('view','cluster'),
  showExpand: computed.not('isCluster'),
  linkName: computed.not('isCluster'),
  showInstanceStates: computed.not('isCluster'),
  showCpu: computed.alias('isCluster'),
  showDisk: computed.alias('isCluster'),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
