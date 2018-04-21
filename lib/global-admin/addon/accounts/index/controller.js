import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  access: service(),
  sortBy: 'username',
  headers: [
    {
      translationKey: 'generic.id',
      name: 'id',
      sort: ['id'],
      width: 150,
    },
    {
      translationKey: 'generic.name',
      name: 'name',
      sort: ['name'],
      // width: '120'
    },
    {
      translationKey: 'accountsPage.index.table.username',
      name: 'username',
      sort: ['username'],
    },
  ],
});
