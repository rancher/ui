import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import FilterState from 'ui/mixins/filter-state';

export default Ember.Controller.extend(FilterState, Sortable, {
  sortBy: 'name',
  headers: [
    {
      name:           'state',
      sort:           ['stateSort','name','id'],
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
