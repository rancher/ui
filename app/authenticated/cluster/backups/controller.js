import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  scope:            service(),
  sortBy:           'created',
  currentClusterId: null,

  headers: [
    {
      name:           'target',
      translationKey: 'backupsPage.table.target.label',
      width:          80,
    },
    {
      name:           'name',
      sort:           ['name', 'id'],
      translationKey: 'backupsPage.table.name',
    },
    {
      classNames:     'text-right pr-20',
      name:           'created',
      sort:           ['created', 'name', 'id'],
      translationKey: 'backupsPage.table.created',
    },
  ],

  rows:    computed('model.[]', function() {
    let { currentClusterId } = this;

    return get(this, 'model').filterBy('clusterId', currentClusterId);
  }),
});
