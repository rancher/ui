import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  settings: service(),
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
