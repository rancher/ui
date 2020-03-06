import Mixin from '@ember/object/mixin';
import { get, set, setProperties, computed } from '@ember/object';
import { inject as service } from '@ember/service'
import { reads } from '@ember/object/computed';
import C from 'ui/utils/constants';

export default Mixin.create({
  scope:       service(),
  intl:        service(),
  globalStore: service(),
  growl:       service(),

  clusterId: reads('scope.currentCluster.id'),
  projectId: reads('scope.currentProject.id'),
  pageScope: reads('scope.currentPageScope'),


  init() {
    this._super(...arguments)
    const pageScope = get(this, 'pageScope');
    const globalStore = get(this, 'globalStore')
    const clusterId = get(this, 'clusterId')
    const projectId = get(this, 'projectId')
    let url = `monitormetrics?action=list${ pageScope }metricname&limit=-1`
    let data = {}

    if (pageScope === 'cluster') {
      data = { clusterId }
    } else {
      data = { projectId }
    }

    if (get(this, 'monitoringEnabled')) {
      globalStore.rawRequest({
        url,
        method: 'POST',
        data,
      }).then((res = {}) => {
        const metrics = res && res.body && res.body.names

        set(this, 'metrics', metrics)
      }).catch((err = {}) => {
        get(this, 'growl').fromError(get(err, 'body.message'));
      });
    }
  },

  monitoringEnabled: computed(function() {
    const ps = get(this, 'pageScope');

    if (ps === 'cluster') {
      return get(this, 'scope.currentCluster.enableClusterMonitoring')
    } else {
      return get(this, 'scope.currentProject.enableProjectMonitoring')
    }
  }),

  beforeSaveClusterAlert(alertRule, group) {
    const clone = alertRule.clone();

    setProperties(clone, {
      clusterId: get(this, 'scope.currentCluster.id'),
      groupId:   group.id,
    })

    const t = get(alertRule, '_targetType');
    const errors = get(this, 'errors') || [];
    const intl = get(this, 'intl');
    const selector = get(clone, 'nodeRule.selector') || {};
    const keys = Object.keys(selector);

    switch (t) {
    case 'node':
      if (!get(clone, 'nodeRule.nodeId')) {
        errors.push(intl.t('alertPage.newOrEdit.nodeRequired'));
      }

      if (get(clone, 'nodeRule.condition') === 'cpu') {
        delete clone.nodeRule.memThreshold
      } else if (get(clone, 'nodeRule.condition') === 'mem') {
        delete clone.nodeRule.cpuThreshold
      } else {
        delete clone.nodeRule.cpuThreshold
        delete clone.nodeRule.memThreshold
      }

      setProperties(clone, {
        'nodeRule.selector': null,
        systemServiceRule:   null,
        eventRule:           null,
        metricRule:          null,
        clusterScanRule:     null,
      });
      break;
    case 'nodeSelector':
      if (keys.length === 0) {
        errors.push(intl.t('alertPage.newOrEdit.nodeSelectorRequired'));
      }
      setProperties(clone, {
        'nodeRule.nodeId': null,
        systemServiceRule: null,
        eventRule:         null,
        metricRule:        null,
        clusterScanRule:   null,
      });
      break;
    case 'systemService':
      setProperties(clone, {
        nodeRule:        null,
        eventRule:       null,
        metricRule:      null,
        clusterScanRule:   null,
      });
      break;
    case 'warningEvent':
    case 'normalEvent':
      setProperties(clone, {
        nodeRule:          null,
        systemServiceRule: null,
        metricRule:        null,
        clusterScanRule:   null,
      });
      break;
    case 'metric':
      setProperties(clone, {
        nodeRule:          null,
        systemServiceRule: null,
        eventRule:         null,
        clusterScanRule:   null,
      });
      break;
    case 'cisScan':
      setProperties(clone, {
        nodeRule:          null,
        systemServiceRule: null,
        eventRule:         null,
        metricRule:        null,
      });
      break;
    }

    set(this, 'errors', errors);

    return clone;
  },

  beforeSaveProjectAlert(alertRule, group) {
    const clone = alertRule.clone();
    const t = get(alertRule, '_targetType');
    const errors = get(this, 'errors') || [];
    const workloadType = get(clone, 'workloadRule.workloadType');
    const workloadSelectorType = get(clone, 'workloadRule.workloadSelectorType');
    const selector = get(clone, 'workloadRule.selector') || {};
    const keys = Object.keys(selector);

    setProperties(clone, {
      projectId: get(this, 'scope.currentProject.id'),
      groupId:   group.id,
    })

    switch (t) {
    case 'workload':
      setProperties(clone, {
        podRule:                 null,
        'workloadRule.selector': null,
        'workloadRule.type':     workloadType,
        metricRule:              null,
      });
      break;
    case 'workloadSelector':
      if (keys.length === 0) {
        errors.push('Workload selector required');
      }
      setProperties(clone, {
        podRule:                   null,
        'workloadRule.workloadId': null,
        'workloadRule.type':       workloadSelectorType,
        metricRule:                null,
      });
      break;
    case 'pod':
      setProperties(clone, {
        workloadRule: null,
        metricRule:   null,
      });
      break;
    case 'metric':
      setProperties(clone, {
        workloadRule: null,
        podRule:      null,
      });
      break;
    }

    set(this, 'errors', errors);

    return clone;
  },

  willSaveMetricRule(toSaveAlert) {
    if (get(toSaveAlert, 'metricRule.comparison') === C.ALERTING_COMPARISON.HAS_VALUE) {
      delete get(toSaveAlert, 'metricRule').thresholdValue
    }

    return toSaveAlert
  },
});
