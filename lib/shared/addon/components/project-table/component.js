import Component from '@ember/component';
import layout from './template';

const headers = [
  {
    name: 'state',
    sort: ['sortState','displayName'],
    searchField: 'displayState',
    translationKey: 'generic.state',
    width: 120,
  },
  {
    name: 'name',
    sort: ['displayName'],
    searchField: 'displayState',
    translationKey: 'projectsPage.table.header.project.label',
  },
  {
    name: 'created',
    sort: ['createdTs'],
    translationKey: 'projectsPage.table.header.created.label',
    width: 200,
  },
];

export default Component.extend({
  layout,
  tagName: '',
  headers,
  sortBy: 'name',
});
