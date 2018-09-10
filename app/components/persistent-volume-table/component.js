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
    sort:           ['sortName', 'id'],
    searchField:    'displayName',
    translationKey: 'generic.name',
  },
  {
    name:           'displayPvc',
    sort:           ['displayPvc', 'sortName', 'id'],
    searchField:    'displayPvc',
    translationKey: 'cruPersistentVolume.pvc',
  },
  {
    name:           'source',
    sort:           ['displaySource', 'name', 'id'],
    searchField:    ['displaySource', 'configName'],
    translationKey: 'persistentVolumePage.source.label',
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
