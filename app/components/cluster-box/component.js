import Ember from 'ember';

export const headersWithCluster = [
  {
    name:           'state',
    sort:           ['stateSort','name','id'],
    translationKey: 'generic.state',
    width:          125,
  },
  {
    name:           'name',
    sort:           ['displayName','id'],
    translationKey: 'clustersPage.environment.label',
  },
  {
    name:           'cluster',
    sort:           ['cluster.displayName','displayName','id'],
    translationKey: 'clustersPage.cluster.label',
  },
  {
    name:           'stacks',
    sort:           ['numStacks','name','id'],
    translationKey: 'generic.stacks',
    width: 100,
  },
  {
    name:           'services',
    sort:           ['numServices','name','id'],
    translationKey: 'generic.services',
    width: 100,
  },
  {
    name:           'containers',
    sort:           ['numContainers','name','id'],
    translationKey: 'generic.containers',
    width: 120,
  },
  {
    name:           'default',
    sort:           false,
    translationKey: 'clusterBox.loginDefault',
    width:          60,
  },
];

export const headersWithoutCluster = headersWithCluster.filter(x => x.name !== 'cluster');

export default Ember.Component.extend({
  classNames: ['box','mt-20','pt-0'],

  sortBy:   'name',
  headers:  headersWithoutCluster,
});
