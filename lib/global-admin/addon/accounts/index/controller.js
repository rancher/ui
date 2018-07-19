import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  access:  service(),
  sortBy:  'username',
  headers: [
    {
      name:           'state',
      sort:           ['sortState', 'displayName'],
      searchField:    'displayState',
      translationKey: 'generic.state',
      width:          120
    },
    {
      translationKey: 'generic.name',
      name:           'name',
      sort:           ['name'],
      width:          250,
    },
    {
      translationKey: 'generic.id',
      name:           'id',
      sort:           ['id'],
    },
    {
      translationKey: 'accountsPage.index.table.username',
      name:           'username',
      sort:           ['username'],
    },
  ],
});
