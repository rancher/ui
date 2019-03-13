import Component from '@ember/component';
import layout from './template';

const headers = [
  {
    name:           'state',
    sort:           ['hasProject', 'sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120,
  },
  {
    name:           'name',
    sort:           ['hasProject', 'displayName'],
    searchField:    ['displayName'],
    translationKey: 'projectsPage.name.label',
  },
  {
    name:           'created',
    sort:           ['hasProject', 'createdTs', ' id'],
    searchField:    false,
    translationKey: 'projectsPage.created.label',
    width:          200,
  },
];

export default Component.extend({
  layout,
  headers,
  tagName: '',
  sortBy:  'name',
});
