import Resource from '@rancher/ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Alert from 'ui/mixins/model-alert';
import C from 'ui/utils/constants';

const clusterAlertRule = Resource.extend(Alert, {
  intl: service(),

  type: 'clusterAlertRule',

  _targetType: 'systemService',

  canClone: true,
  canEdit:  true,

  targetType: computed('systemServiceRule.condition', 'nodeRule.{nodeId,selector}', 'eventRule.resourceKind', 'metricRule.expression', function() {
    if ( get(this, 'systemServiceRule.condition') ) {
      return 'systemService';
    }
    if ( get(this, 'nodeRule.nodeId') ) {
      return 'node'
    }
    if ( get(this, 'nodeRule.selector') ) {
      return 'nodeSelector';
    }
    if ( get(this, 'eventRule.resourceKind') ) {
      return 'event';
    }
    if ( get(this, 'metricRule.expression') ) {
      return 'metric'
    }
    if ( get(this, 'clusterScanRule.scanRunType') ) {
      return 'cisScan';
    }
  }),

  displayTargetType: computed('targetType', function() {
    return get(this, 'intl').t(`alertPage.targetTypes.${ get(this, 'targetType') }`);
  }),

  displayCondition: computed('targetType', 'nodeRule.{condition,cpuThreshold,memThreshold}', 'metricRule.{expression,comparison,thresholdValue}', function() {
    const t = get(this, 'targetType');
    const intl = get(this, 'intl');
    let out = intl.t('alertPage.na');
    const c = get(this, 'nodeRule.condition')
    const cpuThreshold = get(this, 'nodeRule.cpuThreshold');
    const memThreshold = get(this, 'nodeRule.memThreshold');
    const metricRule = get(this, 'metricRule');
    const clusterScanRule = get(this, 'clusterScanRule');

    switch (t) {
    case 'systemService':
      out = intl.t('alertPage.index.table.displayCondition.unhealthy');
      break;
    case 'event':
      out = intl.t('alertPage.index.table.displayCondition.happens');
      break;
    case 'node':
    case 'nodeSelector':
      switch (c) {
      case 'notready':
        out = intl.t('alertPage.index.table.displayCondition.notReady');
        break;
      case 'cpu':
        out = intl.t('alertPage.index.table.displayCondition.cpuUsage', { percent: cpuThreshold });
        break;
      case 'mem':
        out = intl.t('alertPage.index.table.displayCondition.memUsage', { percent: memThreshold });
        break;
      }
      break;
    case 'metric':
      out = metricRule.comparison === C.ALERTING_COMPARISON.HAS_VALUE ? intl.t(`alertPage.comparison.${ metricRule.comparison }`) : `${ intl.t(`alertPage.comparison.${ metricRule.comparison }`) } ${ metricRule.thresholdValue }`
      break;
    case 'cisScan':
      out = clusterScanRule.failuresOnly
        ? intl.t('alertPage.index.table.displayCondition.failure')
        : intl.t('alertPage.index.table.displayCondition.happens');
      break;
    }

    return out
  }),

  threshold: computed('targetType', 'nodeRule.{memThreshold,cpuThreshold,condition}', function() {
    const t = get(this, 'targetType');
    const c = get(this, 'nodeRule.condition');

    if (t === 'node' || t === 'nodeSelector') {
      if (c === 'cpu') {
        return get(this, 'nodeRule.cpuThreshold');
      }
      if (c === 'mem') {
        return get(this, 'nodeRule.memThreshold');
      }
    }
  }),

  actions: {
    clone() {
      get(this, 'router').transitionTo('authenticated.cluster.alert.new-rule', get(this, 'groupId'), { queryParams: { id: get(this, 'id'),  } });
    },
    edit() {
      get(this, 'router').transitionTo('authenticated.cluster.alert.edit-rule', get(this, 'groupId'), get(this, 'id'));
    },
  },

});

export default clusterAlertRule;
