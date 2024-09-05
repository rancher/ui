import { filterBy, alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  scope:              service(),
  modalService:       service('modal'),
  securityScanConfig: service(),
  router:             service(),

  tableHeaders: [
    {
      name:           'state',
      sort:           ['state', 'number', 'id'],
      translationKey: 'cis.scan.table.state',
      width:          100,
    },
    {
      name:           'name',
      sort:           ['id'],
      translationKey: 'cis.scan.table.name',
    },
    {
      name:           'profile',
      sort:           ['profile', 'id'],
      translationKey: 'cis.scan.table.profile',
      width:          200
    },
    {
      name:           'passed',
      sort:           ['passed', 'id'],
      translationKey: 'cis.scan.table.passed',
      width:          80,
    },
    {
      name:           'skipped',
      sort:           ['skipped', 'id'],
      translationKey: 'cis.scan.table.skipped',
      width:          90,
    },
    {
      name:           'failed',
      sort:           ['failed', 'id'],
      translationKey: 'cis.scan.table.failed',
      width:          80,
    },
    {
      name:           'notapplicable',
      sort:           ['notApplicable', 'id'],
      translationKey: 'cis.scan.table.notApplicable',
      width:          150,
    },
    {
      name:           'date',
      sort:           ['createdTS', 'id'],
      searchField:    false,
      translationKey: 'cis.scan.table.date',
      width:          220
    }
  ],
  sortBy:     'date',
  descending: true,

  runningClusterScans: filterBy('clusterScans', 'isRunning', true),

  isRKE:   alias('scope.currentCluster.isRKE'),
  actions: {
    runScan() {
      get(this, 'scope.currentCluster').send('runCISScan');
    },
    setSchedule() {
      get(this, 'scope.currentCluster').send('edit', { scrollTo: 'security-scan' });
    },
    setAlert() {
      this.router.transitionTo('authenticated.cluster.alert.new', { queryParams: { for: 'security-scan' } });
    }
  },
  bulkActionHandler: computed(function() {
    return {
      download: () => {
        console.error('CIS Scan Downloads is no longer available');
      },
      promptDelete: async(scans) => {
        this.modalService.toggleModal('confirm-delete', {
          escToClose: true,
          resources:  scans
        });
      }
    };
  }),
  clusterScans: computed('model.clusterScans.[]', 'scope.currentCluster.id', function() {
    return get(this, 'model.clusterScans').filterBy('clusterId', get(this, 'scope.currentCluster.id'));
  }),
});
