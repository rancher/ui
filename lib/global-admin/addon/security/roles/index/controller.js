import Controller from '@ember/controller';
import FilterState from 'ui/mixins/filter-state';
import { inject as service } from '@ember/service';

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
    width: 80,
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
  authzStore: service('authz-store'),
  searchText: '',
});
