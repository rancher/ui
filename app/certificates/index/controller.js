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
      name:           'cn',
      searchField:    ['cn'],
      sort:           ['cn','id'],
      translationKey: 'certificatesPage.index.table.header.domain',
    },
    {
      name:           'expires',
      sort:           ['expiresDate','id'],
      translationKey: 'certificatesPage.index.table.header.expires',
      width:          120,
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
