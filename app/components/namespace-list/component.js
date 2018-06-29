import Component from '@ember/component';
import layout from './template';
import { alias } from '@ember/object/computed';

export const headers = [
  {
    name:           'state',
    sort:           ['sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120
  },
  {
    name:           'name',
    sort:           ['sortName', 'id'],
    searchField:    'displayName',
    translationKey: 'namespacesPage.table.name.label',
  },
  {
    name:           'project',
    sort:           ['project.sortName', 'id'],
    searchField:    'project.displayName',
    translationKey: 'namespacesPage.table.project.label',
  },
  {
    name:           'created',
    sort:           ['created', 'id'],
    searchField:    'created',
    translationKey: 'namespacesPage.table.created.label',
    width:          250,
  },
];

export default Component.extend({
  layout,
  sortBy:     'name',
  descending: false,
  headers,
  rows:       alias('model'),
});
