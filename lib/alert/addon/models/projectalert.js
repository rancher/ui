import Resource from 'ember-api-store/models/resource';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import alertMixin from 'alert/mixins/model-alert';

const ProjectAlert = Resource.extend(alertMixin, {
  type: 'projectalert',
  intl: service(),

  // _targetType is used for edit,
  _targetType: 'pod',

  displayTargetType: function() {
    const t = get(this, 'targetType');
    const intl = get(this, 'intl');
    return intl.t(`alertPage.targetTypes.${t}`);
  }.property('targetType'),

  displayCondition: function() {
    const t = get(this, 'targetType');
    const intl = get(this, 'intl');
    if (t === 'pod') {
      const c = get(this, 'targetPod.condition');
      if (c === 'restarts') {
        const times = get(this, 'targetPod.restartTimes');
        const interval = get(this, 'targetPod.restartIntervalSeconds');
        return intl.t('alertPage.index.table.displayCondition.restarted', {times, interval: interval/60});
      }
      if (c === 'notscheduled') {
        return intl.t('alertPage.index.table.displayCondition.notScheduled');
      }
      if (c === 'notrunning') {
        return intl.t('alertPage.index.table.displayCondition.notRunning');
      }
      return intl.t('alertPage.na');
    }
    if (t === 'workload' || t === 'workloadSelector') {
      const percent = get(this, 'targetWorkload.availablePercentage');
      return intl.t('alertPage.index.table.displayCondition.available', {percent});
    }
  }.property('targetType', 'targetPod.{condition,restartTimes,restartIntervalSeconds}', 'targetWorkload.{availablePercentage}'),

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
  }.property('targetPod.{podId}', 'targetWorkload.{workloadId,selector}'),
});

export default ProjectAlert;
