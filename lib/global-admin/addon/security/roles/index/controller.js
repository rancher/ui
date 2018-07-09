import Controller from '@ember/controller';
import { computed, get } from '@ember/object';
import FilterState from 'ui/mixins/filter-state';

const headers = [
  {
    name:           'state',
    sort:           ['state', 'name'],
    translationKey: 'generic.state',
    type:           'string',
    width:          125,
  },
  {
    name:           'name',
    sort:           ['name'],
    translationKey: 'rolesPage.index.table.name',
  },
  {
    name:           'builtin',
    sort:           ['builtin'],
    translationKey: 'rolesPage.index.table.builtin',
    width:          120,
  },
  {
    classNames:     'text-right pr-20',
    name:           'created',
    sort:           ['created'],
    translationKey: 'generic.created',
    width:          250,
  },
]

export default Controller.extend(FilterState, {
  sortBy:     'name',
  headers,
  searchText: '',

  rows: computed('filtered.@each.{name,state}', function() {

    return get(this, 'filtered').filterBy('hidden', false);

  }),
});
