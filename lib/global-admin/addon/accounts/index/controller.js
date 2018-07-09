import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  access:  service(),
  sortBy:  'username',
  headers: [
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
