import Controller from '@ember/controller';
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
    translationKey: 'generic.name',
  },
  {
    name:           'source',
    sort:           ['displaySource', 'name', 'id'],
    searchField:    ['displaySource', 'configName'],
    translationKey: 'persistentVolumePage.source.label',
  },
];

export default Controller.extend({
  queryParams: ['sortBy'],
  sortBy:      'name',
  headers,
  rows:        alias('model.persistentVolumes'),
});
