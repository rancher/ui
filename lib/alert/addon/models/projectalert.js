import Resource from 'ember-api-store/models/resource';
import { get, set } from '@ember/object';
import alertMixin from 'alert/mixins/model-alert';

const ProjectAlert = Resource.extend(alertMixin, {
  type: 'projectalert',

  // _targetType is used for edit,
  _targetType: 'pod',

  targetType: function() {
    const tp = get(this, 'targetPod');
    const tw = get(this, 'targetWorkload');
    if (tp && tp.podId) {
      return 'pod';
    }
    if (tw && tw.workloadId) {
      return 'workload'
    }
    if (tw && tw.selector) {
      return 'workloadSelector';
    }
  }.property('model.targetPod.{podId}', 'model.targetWorkload.{workloadId,selector}'),
});

export default ProjectAlert;
