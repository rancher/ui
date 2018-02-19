import Resource from 'ember-api-store/models/resource';
import { get, set } from '@ember/object';
import alertMixin from 'alert/mixins/model-alert';

const ClusterAlert = Resource.extend(alertMixin, {
  type: 'clusteralert',

  init(...args) {
    this._super(...args);
  },

  _targetType: 'systemService',

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
  }.property('model.targetSystemService', 'model.targetNode{nodeId,selector}', 'model.targetEvent.{resourceKind}'),

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
  }.property('targetType', 'model.targetNode.{memThreshold,cpuThreshold,condition}'),
});
export default ClusterAlert;
