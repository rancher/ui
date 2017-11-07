import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

const headersWithCluster = [
  {
    name:           'state',
    sort:           ['sortState','name','id'],
    translationKey: 'generic.state',
    width:          125,
  },
  {
    name:           'cluster',
    sort:           ['cluster.displayName','displayName','id'],
    translationKey: 'clustersPage.cluster.label',
    searchField:   ['cluster.displayName'],
  },
  {
    name:           'name',
    sort:           ['displayName','id'],
    translationKey: 'clustersPage.environment.label',
    searchField:    ['displayName'],
  },
  {
    name:           'stacks',
    sort:           ['numStacks','name','id'],
    translationKey: 'generic.stacks',
    width: 100,
    classNames: 'text-center',
  },
  {
    name:           'services',
    sort:           ['numServices','name','id'],
    translationKey: 'generic.services',
    width: 100,
    classNames: 'text-center',
  },
  {
    name:           'containers',
    sort:           ['numContainers','name','id'],
    translationKey: 'generic.containers',
    width: 120,
    classNames: 'text-center',
  },
  {
    name:           'default',
    sort:           false,
    translationKey: 'clusterRow.loginDefault',
    width:          60,
    classNames: 'text-center',
  },
];

const headersWithoutCluster = headersWithCluster.filter(x => x.name !== 'cluster');

export default Component.extend({
  layout,
  tagName: '',
  showCluster: false,
  bulkActions: true,
  search: true,

  headers: computed('showCluster', function() {
    if ( this.get('showCluster') ) {
      return headersWithCluster;
    } else {
      return headersWithoutCluster;
    }
  }),
});
