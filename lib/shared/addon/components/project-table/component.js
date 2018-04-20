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
    searchField: [ 'displayName', 'name' ],
    translationKey: 'projectsPage.name.label',
  },
  {
    name: 'created',
    sort: ['createdTs'],
    translationKey: 'projectsPage.created.label',
    width: 200,
  },
];

export default Component.extend({
  layout,
  headers,
  tagName: '',
  sortBy: 'name',
});
