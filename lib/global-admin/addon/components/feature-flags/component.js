import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';

const FEATURE_HEADERS = [
  {
    translationKey: 'featureFlags.table.state',
    name:           'state',
    sort:           ['state'],
    width:          '100px',
  },
  {
    translationKey: 'featureFlags.table.restart',
    name:           'restart',
    sort:           ['status.dynamic'],
    width:          '90px',
  },
  {
    translationKey: 'featureFlags.table.name',
    name:           'name',
    sort:           ['name'],
    searchField:    'name',
    width:          '300px',
  },
  {
    translationKey: 'featureFlags.table.description',
    name:           'description',
    sort:           ['description'],
    searchField:    'description',
  },
];

export default Component.extend({
  intl:     service(),
  settings: service(),

  layout,

  bulkActions:         false,
  descending:          false,
  featuresHeaders:     FEATURE_HEADERS,
  model:               null,
  searchText:          '',
  sortBy:              'name',
  stickyHeader:        false,
});
