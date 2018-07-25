import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';

const headers = [
  {
    name:           'state',
    sort:           ['sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120
  },
  {
    name:           'name',
    sort:           ['displayName'],
    searchField:    ['displayName', 'name'],
    translationKey: 'projectsPage.ns.label',
  },
  {
    name:           'resourceQuotaTemplate.displayName',
    sort:           ['resourceQuotaTemplate.displayName'],
    searchField:    ['resourceQuotaTemplate.displayName'],
    translationKey: 'projectsPage.quota.label',
  },
  {
    name:           'created',
    sort:           ['createdTs'],
    translationKey: 'projectsPage.created.label',
    width:          250,
  },
];

export default Component.extend({
  scope: service(),

  layout,
  headers,
  tagName:    '',
  sortBy:     'name',
  searchText: '',
  subRows:    true,
  suffix:     true,
  paging:     true,
});
