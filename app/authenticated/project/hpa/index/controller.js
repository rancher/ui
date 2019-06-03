import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  scope:             service(),

  sortBy:            'name',

  headers: [
    {
      name:           'state',
      sort:           ['sortState', 'displayName'],
      searchField:    'displayState',
      translationKey: 'generic.state',
      width:          120
    },
    {
      name:           'name',
      sort:           ['displayName', 'id'],
      searchField:    'displayName',
      translationKey: 'generic.name',
    },
    {
      name:           'workloadId',
      searchField:    'workload.displayName',
      translationKey: 'hpaPage.table.target.label',
      width:          200
    },
    {
      name:           'currentReplicas',
      sort:           ['currentReplicas', 'displayName', 'id'],
      searchField:    'currentReplicas',
      translationKey: 'hpaPage.table.replicas.current',
      width:          200
    },
    {
      name:           'lastScaleTime',
      sort:           ['lastScaleTime', 'id'],
      classNames:     'text-right pr-20',
      searchField:    'lastScaleTime',
      translationKey: 'hpaPage.table.lastScaleTime.label',
      width:          200
    },
  ],

  rows: alias('model.data'),
});
