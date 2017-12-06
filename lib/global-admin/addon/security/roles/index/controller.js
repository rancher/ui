import Controller from '@ember/controller';
import FilterState from 'ui/mixins/filter-state';

const headers = [
  {
    translationKey: 'rolesPage.index.table.name',
    name: 'name',
    sort: ['name'],
  },
  {
    translationKey: 'rolesPage.index.table.builtin',
    name: 'builtin',
    sort: ['builtin'],
    width: 120,
  },
  {
    translationKey: 'generic.created',
    name: 'created',
    sort: ['created'],
    width: 200,
  },
]

export default Controller.extend(FilterState, {
  sortBy: 'name',
  headers: headers,
  searchText: '',
});
