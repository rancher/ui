import Controller from '@ember/controller';
import { computed, get } from '@ember/object';
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
    translationKey: 'rolesPage.index.table.enabled',
    name: 'enabled',
    sort: ['enabled'],
    width: 120,
  },
  {
    translationKey: 'rolesPage.index.table.hidden',
    name: 'hidden',
    sort: ['hidden'],
    width: 120,
  },
  {
    translationKey: 'generic.created',
    name: 'created',
    sort: ['created'],
    classNames: 'text-right pr-20',
    width: 250,
  },
]

export default Controller.extend(FilterState, {
  sortBy: 'name',
  headers: headers,
  searchText: '',

  rows: computed('filtered.@each.{name,state}', function () {
    return get(this, 'filtered').filterBy('hidden', false);
  }),
});
