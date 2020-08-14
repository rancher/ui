import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  scope:            service(),
  sortBy:           'created',
  currentClusterId: null,

  headers: [
    {
      name:           'state',
      sort:           ['sortState', 'displayName'],
      searchField:    'displayState',
      translationKey: 'generic.state',
      width:          120
    },
    {
      name:           'target',
      translationKey: 'backupsPage.table.target.label',
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
      searchField:    false,
      translationKey: 'backupsPage.table.created',
    },
  ],

  actions: {
    snapshotNow() {
      get(this, 'scope.currentCluster').doAction('backupEtcd');
    },
  },
  rows:    computed('model.[]', function() {
    let { currentClusterId } = this;

    return get(this, 'model').filterBy('clusterId', currentClusterId);
  }),

});
