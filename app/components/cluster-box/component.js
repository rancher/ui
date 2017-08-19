import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['box','mt-20','pt-0'],

  sortBy:   'name',
  headers:  [
    {
      name:           'state',
      sort:           ['stateSort','name','id'],
      translationKey: 'generic.state',
      width:          125,
    },
    {
      name:           'name',
      sort:           ['name','id'],
      translationKey: 'clustersPage.environment.label',
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
  ],
});
