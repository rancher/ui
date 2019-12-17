import Controller from '@ember/controller';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  modalService:       service('modal'),
  router:             service(),
  scope:              service(),
  growl:              service(),
  intl:               service(),
  securityScanConfig: service(),

  tableHeaders: [
    {
      name:           'collapse',
      width:          40,
    },
    {
      name:           'state',
      sort:           ['state', 'sortableId'],
      translationKey: 'cis.scan.detail.table.state',
      width:          100,
    },
    {
      name:           'id',
      sort:           ['sortableId'],
      translationKey: 'cis.scan.detail.table.number',
      width:          100,
    },
    {
      name:           'description',
      sort:           ['description', 'sortableId'],
      translationKey: 'cis.scan.detail.table.description',
    },
    {
      name:           'buttons',
      width:          120,
    }
  ],
  sortBy: 'id',

  runningClusterScans: computed.filterBy('clusterScans', 'isRunning', true),

  disableRunScanButton: computed.notEmpty('runningClusterScans'),

  actions: {
    async runScan() {
      await get(this, 'scope.currentCluster').doAction('runSecurityScan', {
        failuresOnly: false,
        skip:         null
      });
      get(this, 'router').replaceWith('authenticated.cluster.cis/scan');
    },
    download() {
      get(this, 'model.scan').send('download');
    },
    async delete() {
      await get(this, 'modalService').toggleModal('confirm-delete', {
        escToClose:       true,
        resources:        [get(this, 'model.scan')],
        onDeleteFinished: () => get(this, 'router').replaceWith('authenticated.cluster.cis/scan')
      });
    }
  },

  tests: computed('model.scan.report', 'securityScanConfig.skipList', function() {
    const results = get(this, 'model.scan.report.results');

    if (!results) {
      return [];
    }

    const tests = results.reduce((agg, result) => [...agg, ...result.checks], []);

    return tests.map((test) => {
      const state = this.getCheckState(test);
      const nodeTypes = test.node_type;

      const nodeNames = nodeTypes.reduce((agg, nodeType) => [...agg, ...get(this, `model.scan.report.nodes.${ nodeType }`)], []);
      const uniqueNodeNames = Object.keys(nodeNames.reduce((agg, nodeName) => ({
        ...agg,
        [nodeName]: true
      }), {}));
      const checkNodes = test.nodes || [];
      const nodes = uniqueNodeNames.map((nodeName) => ({
        state:  this.getNodeState(test, nodeName, checkNodes),
        nodeId: get(this, 'model.nodes').findBy('nodeName', nodeName).id,
        name:   nodeName
      }));

      return {
        state,
        id:                test.id,
        sortableId:        this.createSortableId(test.id),
        description:       test.description,
        remediation:       state === 'Fail' ? test.remediation : null,
        nodes,
        toggleSkip:        () => {
          this.toggleSkip(test.id)
        },
        skipList:          get(this, 'securityScanConfig.skipList'),
        _availableActions: []
      };
    });
  }),



  clusterScans: computed('model.clusterScans.@each', function() {
    return get(this, 'model.clusterScans').filterBy('clusterId', get(this, 'scope.currentCluster.id'));
  }),

  /**
   * Converts an id that looks like 1.1.9 into 000010000100009. This
   * allows us to appropriately compare the ids as if they are versions
   * instead of just doing a naive string comparison.
   * @param {*} id
   */
  createSortableId(id) {
    const columnWidth = 5;
    const splitId = id.split('.');

    return splitId
      .map((column) => {
        const columnPaddingWidth = Math.max(columnWidth - column.length, 0)

        return '0'.repeat(columnPaddingWidth) + column;
      })
      .join('');
  },

  toggleSkip(testId) {
    this.securityScanConfig.validateSecurityScanConfig();
    const isSkipped = get(this, 'securityScanConfig.skipList').indexOf(testId) !== -1;
    const fn = isSkipped ? this.unskip : this.skip;

    fn.call(this, testId);
  },

  skip(testId) {
    const newSkipList = [...get(this, 'securityScanConfig.skipList'), testId];

    this.securityScanConfig.editSkipList(newSkipList);
  },

  unskip(testId) {
    const newSkipList = get(this, 'securityScanConfig.skipList').filter((skippedTestId) => skippedTestId !== testId);

    this.securityScanConfig.editSkipList(newSkipList);
  },

  getCheckState(check) {
    switch (check.state) {
    case 'pass':
      return 'Pass';
    case 'skip':
      return 'Skipped';
    default:
      return 'Fail';
    }
  },

  /**
   * Per the API.
   * When check state is pass Pass.
   * When check state is fail Fail.
   * When check state is skip Skip.
   * When check state is mixed fail if nodeName is in checkNodes otherwise pass
   */
  getNodeState(check, nodeName, checkNodes) {
    if (check.state === 'pass') {
      return 'Pass';
    }

    if (check.state === 'fail') {
      return 'Fail';
    }

    if (check.state === 'skip') {
      return 'Skipped';
    }

    return checkNodes.includes(nodeName)
      ? 'Fail'
      : 'Pass';
  }

});
