import Controller from '@ember/controller';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';

const CONFIG_MAP_FILE_KEY = 'config.json';
const CONFIG_MAP_NAMESPACE_ID = 'security-scan';
const CONFIG_MAP_NAME = 'security-scan-cfg';
const CONFIG_MAP_ID = `${ CONFIG_MAP_NAMESPACE_ID }:${ CONFIG_MAP_NAME }`;
const CONFIG_MAP_DEFAULT_DATA = { [CONFIG_MAP_FILE_KEY]: JSON.stringify({ skip: [] }) };

export default Controller.extend({
  modalService: service('modal'),
  router:       service(),
  scope:        service(),
  growl:        service(),
  intl:         service(),
  projectStore: service('store'),

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

  runningClusterScans: computed.filterBy('clusterScans', 'isRunning', true),

  disableRunScanButton: computed.notEmpty('runningClusterScans'),

  actions: {
    async runScan() {
      await get(this, 'scope.currentCluster').doAction('runSecurityScan', {
        failuresOnly: false,
        skip:         []
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

  tests: computed('model.scan.report', 'skipList', function() {
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
      const nodes = uniqueNodeNames.map((nodeName) => ({
        state,
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
        skipList:          get(this, 'skipList'),
        _availableActions: []
      };
    });
  }),

  securityScanConfig: computed('model.configMaps.@each', function() {
    const configMaps = get(this, 'model.configMaps');
    const config = configMaps.findBy('id', CONFIG_MAP_ID);

    return config
      ? config
      : this.createAndSaveDefaultConfigMap();
  }),

  parsedSecurityScanConfig: computed('securityScanConfig.data.@each', function() {
    try {
      return JSON.parse(get(this, 'securityScanConfig.data')[CONFIG_MAP_FILE_KEY]);
    } catch (error) {
      this.growl.fromError(this.intl.t('cis.scan.detail.error.parseConfig'), error.message);
    }
  }).volatile(),

  skipList: computed('securityScanConfig.data.@each', function() {
    const skip = get(this, 'parsedSecurityScanConfig.skip');

    return skip ? skip : [];
  }),

  clusterScans: computed('model.clusterScans.@each', function() {
    return get(this, 'model.clusterScans').filterBy('clusterId', get(this, 'scope.currentCluster.id'));
  }),

  createAndSaveDefaultConfigMap() {
    try {
      const configMaps = get(this, 'model.configMaps');
      const systemProjectLink = get(this, 'scope.currentCluster.systemProject.links.self');
      const creationUrl =  `${ systemProjectLink }/configmap`;
      const recordLink =  `${ systemProjectLink }/configMaps/${ CONFIG_MAP_ID }`;
      const configRecord = get(this, 'projectStore').createRecord({
        type:        'configMap',
        id:          CONFIG_MAP_ID,
        namespaceId: CONFIG_MAP_NAMESPACE_ID,
        name:        CONFIG_MAP_NAME,
        data:        CONFIG_MAP_DEFAULT_DATA,
        links:       {}
      });

      configMaps.pushObject(configRecord);
      configRecord.save({
        url:    creationUrl,
        method: 'POST'
      });

      // We have to set this link after .save instead of before because .save will attempt to
      // use the self link to save the record and saving the record isn't setting the self link.
      set(configRecord, 'links.self', recordLink);

      return configRecord;
    } catch (error) {
      this.growl.fromError(this.intl.t('cis.scan.detail.error.createDefault'), error.message);
    }
  },

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
    const isSkipped = get(this, 'skipList').indexOf(testId) !== -1;
    const fn = isSkipped ? this.unskip : this.skip;

    fn.call(this, testId);
  },

  skip(testId) {
    this.editSecurityScanConfig((value) => {
      value.skip.push(testId);

      return value;
    });
  },

  unskip(testId) {
    this.editSecurityScanConfig((value) => {
      value.skip = value.skip.filter((skippedTestId) => skippedTestId !== testId);

      return value;
    });
  },

  editSecurityScanConfig(editorFn) {
    const securityScanConfig = get(this, 'securityScanConfig');

    const value = get(this, 'parsedSecurityScanConfig');

    if (!value) {
      return;
    }
    const newValue = editorFn(value);

    set(securityScanConfig, 'data', {
      ...securityScanConfig.data,
      [CONFIG_MAP_FILE_KEY]: JSON.stringify(newValue)
    });
    securityScanConfig.save();
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
  }

});
