import { alias, equal } from '@ember/object/computed';
import Resource from 'ember-api-store/models/resource';
import { computed, get, set, observer } from '@ember/object';
import moment from 'moment';
import { downloadFile } from 'shared/utils/download-files';
import ObjectsToCsv from 'objects-to-csv';
import { extractUniqueStrings } from '../utils/util';
import { toTitle } from 'shared/utils/util';
import { inject as service } from '@ember/service';

const ClusterScan = Resource.extend({
  intl: service(),

  type:          'clusterScan',
  report:        'null',
  reportPromise: null,
  total:         alias('summary.total'),
  passed:        alias('summary.passed'),
  skipped:       alias('summary.skipped'),
  failed:        alias('summary.failed'),
  notApplicable: alias('summary.notApplicable'),

  isRunning: equal('state', 'running'),

  loader: observer('store', 'state', function() {
    this.loadReport();
  }),

  file: computed('name', 'report', 'resultsForCsv', function(){
    return {
      name: `${ this.name }.csv`,
      file:  this.resultsForCsv
    };
  }),

  csvFile: computed('file', async function() {
    const file = this.file;

    return {
      ...file,
      file: await (new ObjectsToCsv(file.file).toString())
    }
  }),

  availableActions: computed(() => {
    return [
      {
        sort:     97,
        label:    'action.download',
        icon:     'icon icon-download',
        action:   'download',
        bulkable: true,
        enabled:  true,
      }
    ]
  }),

  referencedResults: computed('report.results', function() {
    return (get(this, 'report.results') || [])
      .map((result) => result.checks)
      .reduce((agg, check) => [...agg, ...(check || [])], []);
  }),

  resultsForCsv: computed('profile', 'referencedResults', 'report', function() {
    return this.referencedResults.map((result) => {
      const intl = this.intl;
      const nodesAndStateForTest = this.getNodesAndStateForTestResult(result);
      const profile = intl.t('cis.scan.report.headers.profile', { profile: this.profile });

      return {
        [profile]:                                        '',
        ...result,
        [intl.t('cis.scan.report.headers.nodes')]:        nodesAndStateForTest.nodes.join(','),
        [intl.t('cis.scan.report.headers.passed_nodes')]: nodesAndStateForTest.passedNodes.join(','),
        [intl.t('cis.scan.report.headers.failed_nodes')]: nodesAndStateForTest.failedNodes.join(','),
        [intl.t('cis.scan.report.headers.node_type')]:    result.node_type.join(',')
      };
    });
  }),

  summary: computed('state', 'report', function() {
    const state = this.state;
    const report = this.report;

    if (state === 'activating' || !report) {
      return {};
    }

    return {
      total:             report.total,
      passed:            report.pass,
      skipped:           report.skip,
      failed:            report.fail,
      notApplicable:     report.notApplicable,
    };
  }),

  profile: computed('report.version', 'scanConfig.cisScanConfig.profile', function() {
    const version = (get(this, 'report.version') || '').toUpperCase();
    const profile = (get(this, 'scanConfig.cisScanConfig.profile') || '');

    return version && profile ? toTitle(`${ version } ${ profile }`) : '';
  }),

  createdDate: computed('status.conditions.@each.[status,type]', function() {
    if (!get(this, 'status.conditions')) {
      return '';
    }

    const createdCondition = get(this, 'status.conditions').find(((condition) => condition.type === 'Created'));

    if (!createdCondition) {
      return '';
    }

    return moment(createdCondition.lastUpdateTime).format('dddd MMM D HH:mm:ss');
  }),

  actions:       {
    async download() {
      const file = await this.csvFile;

      downloadFile(file.name, file.file, 'text/plain');
    },
  },

  getNodes(nodes, nodeTypes) {
    return nodeTypes.reduce((agg, nodeType) => [...agg, ...nodes[nodeType]], []);
  },

  getNodeNamesFromNodeType(nodeType) {
    const nodeNames = nodeType
      .reduce((agg, nodeType) => [...agg, ...get(this, `report.nodes.${ nodeType }`)], []);

    return extractUniqueStrings(nodeNames);
  },

  getNodesAndStateForTestResult(testResult) {
    const nodeNames = this.getNodeNamesFromNodeType(testResult.node_type);

    if (testResult.state === 'skip') {
      return {
        nodes:       nodeNames,
        passedNodes: [],
        failedNodes: []
      }
    }

    if (testResult.state === 'pass') {
      return {
        nodes:       nodeNames,
        passedNodes: nodeNames,
        failedNodes: []
      }
    }

    if (testResult.state === 'fail') {
      return {
        nodes:       nodeNames,
        passedNodes: [],
        failedNodes: nodeNames
      }
    }

    if (testResult.state === 'notApplicable') {
      return {
        nodes:       nodeNames,
        passedNodes: [],
        failedNodes: []
      }
    }

    // if mixed
    return {
      nodes:       nodeNames,
      passedNodes: nodeNames.filter((node) => !testResult.nodes.includes(node)),
      failedNodes: testResult.nodes
    }
  },

  async _loadReport() {
    try {
      const report = await this.followLink('report');

      set(this, 'report', report);

      return report;
    } catch (ex) {
      set(this, 'report', '');

      return '';
    }
  },

  async loadReport() {
    const reportPromise = this.reportPromise;

    if (reportPromise) {
      return reportPromise;
    }

    const newReportPromise = this._loadReport();

    set(this, 'reportPromise', newReportPromise);

    return newReportPromise;
  },

});

ClusterScan.reopenClass({ stateMap: { 'running': { color: 'text-info' } } });

export default ClusterScan;