import Controller from '@ember/controller';

export default Controller.extend({
  sortBy: 'name',
  headers: [
    {
      name:           'state',
      sort:           ['sortState','name','id'],
      translationKey: 'certificatesPage.index.table.header.state',
      width:          125,
    },
    {
      name:           'name',
      sort:           ['name','id'],
      translationKey: 'certificatesPage.index.table.header.name',
    },
    {
      name:           'cn',
      searchField:    ['CN'],
      sort:           ['CN','id'],
      translationKey: 'certificatesPage.index.table.header.domain',
    },
    {
      name:           'expires',
      sort:           ['expiresDate','id'],
      translationKey: 'certificatesPage.index.table.header.expires',
      width:          120,
    },
  ],
});
