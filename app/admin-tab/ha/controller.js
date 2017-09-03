import Ember from 'ember';

export default Ember.Controller.extend({
  settings: Ember.inject.service(),
  sortBy:   'address',

  headers: [
    {
      translationKey: 'generic.uuid',
      name:           'uuid',
      sort:           ['sortState','address','uuid'],
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
      width:          80
    },
    {
      translationKey: 'haPage.table.clustered',
      name:           'clustered',
      sort:           ['clustered','address','uuid'],
      width:          110
    },
    {
      translationKey: 'haPage.table.heartbeat',
      name:           'heartbeat',
      sort:           ['heartbeat','address','uuid'],
      width:          200
    },
  ],
});
