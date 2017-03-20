import Ember from 'ember';

export default Ember.Controller.extend({
  settings: Ember.inject.service(),
  sortBy:   'address',

  headers: [
    {
      translationKey: 'generic.uuid',
      name:           'uuid',
      sort:           ['stateSort','address','uuid'],
      width:          '280px'
    },
    {
      translationKey: 'haPage.table.address',
      name:           'address',
      sort:           ['address','uuid'],
    },
    {
      translationKey: 'haPage.table.port',
      name:           'port',
      sort:           ['port','address','uuid'],
      width:          '80px'
    },
    {
      translationKey: 'haPage.table.clustered',
      name:           'clustered',
      sort:           ['clustered','address','uuid'],
      width:          '100px'
    },
    {
      translationKey: 'haPage.table.heartbeat',
      name:           'heartbeat',
      sort:           ['heartbeat','address','uuid'],
      width:          '200px'
    },
  ],
});
