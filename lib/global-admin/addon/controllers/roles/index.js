import Controller from '@ember/controller';
import FilterState from 'ui/mixins/filter-state';

const headers = [
  {
    translationKey: 'rolesPage.index.table.name',
    name: 'name',
    sort: ['name'],
  },
  {
    translationKey: 'rolesPage.index.table.created',
    name: 'created',
    sort: ['created'],
    width: '125',
  },
]

export default Controller.extend(FilterState, {
  sortBy: 'name',
  headers: headers,
});
