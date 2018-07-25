import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

const headers = [
  {
    name:           'name',
    sort:           ['sortName', 'id'],
    searchField:    'displayName',
    translationKey: 'quotaTemplatesPage.table.name.label',
  },
  {
    name:           'default',
    sort:           ['isDefault', 'name', 'id'],
    searchField:    null,
    translationKey: 'quotaTemplatesPage.table.default.label',
    width:          250,
  },
  {
    name:           'created',
    sort:           ['created', 'id'],
    searchField:    'created',
    translationKey: 'quotaTemplatesPage.table.created.label',
    width:          250,
  },
];

export default Controller.extend({
  scope:  service(),

  headers,
  sortBy: 'name',

  rows: computed('model.@each.{isDefault,name}', function() {
    return get(this, 'model').filterBy('clusterId', get(this, 'scope.currentCluster.id'));
  })
});
