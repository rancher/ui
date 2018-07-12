import Resource from 'ember-api-store/models/resource';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import alertMixin from 'alert/mixins/model-alert';

const ClusterAlert = Resource.extend(alertMixin, {
  targetType: function() {

    const targetSystemService = get(this, 'targetSystemService');
    const targetNode = get(this, 'targetNode');
    const targetEvent = get(this, 'targetEvent');

    if (targetSystemService && targetSystemService.condition) {

      return 'systemService';

    }
    if (targetNode && targetNode.nodeId) {

      return 'node'

    }
    if (targetNode && targetNode.selector) {

      return 'nodeSelector';

    }
    if (targetEvent && targetEvent.resourceKind) {

      return 'event';

    }

  }.property('targetSystemService.{condition}', 'targetNode{nodeId,selector}', 'targetEvent.{resourceKind}'),

  displayTargetType: function() {

    const t = get(this, 'targetType');
    const intl = get(this, 'intl');

    return intl.t(`alertPage.targetTypes.${ t }`);

  }.property('targetType'),

  displayCondition: function() {

    const t = get(this, 'targetType');
    const intl = get(this, 'intl');

    if (t === 'systemService') {

      return intl.t('alertPage.index.table.displayCondition.unhealthy');

    }
    if (t === 'event') {

      return intl.t('alertPage.index.table.displayCondition.happens');

    }
    if (t === 'node' || t === 'nodeSelector') {

      const c = get(this, 'targetNode.condition');

      if (c === 'notready') {

        return intl.t('alertPage.index.table.displayCondition.notReady');

      }
      if (c === 'cpu') {

        const n = get(this, 'targetNode.cpuThreshold');

        return intl.t('alertPage.index.table.displayCondition.cpuUsage', { percent: n });

      }
      if (c === 'mem') {

        const n = get(this, 'targetNode.memThreshold');

        return intl.t('alertPage.index.table.displayCondition.memUsage', { percent: n });

      }

    }

    return intl.t('alertPage.na');

  }.property('targetType', 'targetNode.{condition,cpuThreshold,memThreshold}'),

  threshold: function() {

    const t = get(this, 'targetType');
    const c = get(this, 'targetNode.condition');

    if (t === 'node' || t === 'nodeSelector') {

      if (c === 'cpu') {

        return get(this, 'targetNode.cpuThreshold');

      }
      if (c === 'mem') {

        return get(this, 'targetNode.memThreshold');

      }

    }

    return null;

  }.property('targetType', 'targetNode.{memThreshold,cpuThreshold,condition}'),
  intl: service(),
  type: 'clusteralert',

  init(...args) {

    this._super(...args);

  },

  _targetType: 'systemService',

});

export default ClusterAlert;
