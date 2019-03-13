import Controller from '@ember/controller';
import FilterState from 'ui/mixins/filter-state';

const headers = [
  {
    translationKey: 'podSecurityPoliciesPage.index.table.name',
    name:           'name',
    sort:           ['name'],
  },
  {
    translationKey: 'generic.created',
    name:           'created',
    sort:           ['created'],
    searchField:    false,
    classNames:     'text-right pr-20',
    width:          '200',
  },
]

export default Controller.extend(FilterState, {
  sortBy:     'name',
  headers,
  searchText: '',
});
