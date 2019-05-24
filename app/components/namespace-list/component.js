import Component from '@ember/component';
import layout from './template';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

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
    classNames:     'text-right pr-20',
    name:           'created',
    sort:           ['created', 'id'],
    searchField:    false,
    translationKey: 'namespacesPage.table.created.label',
    width:          250,
  },
];

export default Component.extend({
  scope: service(),

  layout,
  sortBy:            'name',
  descending:        false,
  headers,
  extraSearchFields: [
    'displayUserLabelStrings',
  ],
  rows:       alias('model'),
});
