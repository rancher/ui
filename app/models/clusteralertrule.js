import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Alert from 'ui/mixins/model-alert';

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
  }),

  displayTargetType: computed('targetType', function() {
    return get(this, 'intl').t(`alertPage.targetTypes.${ get(this, 'targetType') }`);
  }),

  displayCondition: computed('targetType', 'nodeRule.{condition,cpuThreshold,memThreshold}', 'metricRule.{expression,comparison,thresholdValue}', function() {
    const t = get(this, 'targetType');
    const intl = get(this, 'intl');

    if (t === 'systemService') {
      return intl.t('alertPage.index.table.displayCondition.unhealthy');
    }
    if (t === 'event') {
      return intl.t('alertPage.index.table.displayCondition.happens');
    }
    if (t === 'node' || t === 'nodeSelector') {
      const c = get(this, 'nodeRule.condition');

      if (c === 'notready') {
        return intl.t('alertPage.index.table.displayCondition.notReady');
      }
      if (c === 'cpu') {
        const n = get(this, 'nodeRule.cpuThreshold');

        return intl.t('alertPage.index.table.displayCondition.cpuUsage', { percent: n });
      }
      if (c === 'mem') {
        const n = get(this, 'nodeRule.memThreshold');

        return intl.t('alertPage.index.table.displayCondition.memUsage', { percent: n });
      }
    }

    if (t === 'metric') {
      const metricRule = get(this, 'metricRule')

      return `${ intl.t(`alertPage.comparison.${ metricRule.comparison }`) } ${ metricRule.thresholdValue }`
    }

    return intl.t('alertPage.na');
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
