import Controller from '@ember/controller';

export default Controller.extend({
  sortBy: 'name',
  headers: [
    {
      name: 'name',
      sort: ['name', 'id'],
      translationKey: 'certificatesPage.index.table.header.name',
    },
    {
      name: 'created',
      sort: ['created', 'id'],
      classNames: 'text-right pr-20',
      searchField: 'created',
      translationKey: 'certificatesPage.index.table.header.created',
    },
  ],
});
