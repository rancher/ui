import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import C from 'ui/utils/constants';

const headers = [
  {
    name:           'state',
    sort:           ['sortState', 'displayName'],
    searchField:    'displayState',
    translationKey: 'generic.state',
    width:          120,
  },
  {
    name:           'scope',
    sort:           ['clusterId', 'projectId'],
    searchField:    ['clusterId',  'projectId'],
    translationKey: 'generic.scope',
    width:          120,
  },
  {
    name:           'name',
    sort:           ['displayName', 'id'],
    searchField:    'displayName',
    translationKey: 'generic.name',
    width:          250,
  },
  {
    name:           'url',
    sort:           ['url', 'displayName'],
    translationKey: 'catalogSettings.more.url.label',
  },
  {
    name:           'branch',
    sort:           ['branch', 'displayName'],
    translationKey: 'catalogSettings.more.branch.label',
    width:          120,
  },
];

export default Component.extend({
  settings:     service(),
  layout,
  headers,
  tagName:      null,
  catalogs:     null,
  sortBy:       'name',
  descending:   false,
  paging:       true,
  rightActions: true,

  filtered: computed('catalogs', function() {
    return get(this, 'catalogs').filter((catalog) => {
      return !(get(catalog, 'name') === C.CATALOG.SYSTEM_LIBRARY_KEY && get(catalog, 'url') === C.CATALOG.SYSTEM_LIBRARY_VALUE);
    });
  })
});
