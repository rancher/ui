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
    name:           'provisioner',
    sort:           ['provisioner', 'name', 'id'],
    searchField:    ['displayProvisioner', 'provisioner'],
    translationKey: 'storageClassPage.provisioner.label',
  },
  {
    name:           'default',
    sort:           ['isDefault', 'name', 'id'],
    searchField:    null,
    translationKey: 'storageClassPage.default.label',
    width:          100,
  },
];

export default Controller.extend({
  queryParams: ['sortBy'],
  sortBy:      'name',
  headers,
  rows:        alias('model.storageClasses'),
});
