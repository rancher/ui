import { get, set } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import notifierMixin from 'alert/mixins/notifier';

export default Component.extend(notifierMixin, {
  intl: service(),
  model: null,
  tagName: 'TR',
  classNames: 'main-row',
  bulkActions: true,

  displayCondition: function() {
    const t = get(this, 'model.targetType');
    const intl = get(this, 'intl');
    if (t === 'pod') {
      const c = get(this, 'model.targetPod.condition');
      if (c === 'restarts') {
        const times = get(this, 'model.targetPod.restartTimes');
        const interval = get(this, 'model.targetPod.restartIntervalSeconds');
        // return intl.t('alertPage.index.table.restarted', {times, interval: interval/60});
      }
      if (c === 'notscheduled') {
        return intl.t('alertPage.index.table.displayCondition.notScheduled');
      }
      if (c === 'notrunning') {
        return intl.t('alertPage.index.table.displayCondition.notRunning');
      }
      return intl.t('alertPage.na');
    }
    if (t == 'workload' || t === 'workloadSelector') {
      const percent = get(this, 'model.targetWorkload.availablePercentage');
      return intl.t('alertPage.index.table.displayCondition.available', {percent});
    }
  }.property('model.targetType', 'model.targetPod.{condition,restartTimes}', 'model.targetWorkload.{availablePercentage}'),

  isRestartCondition: function() {
    const t = get(this, 'model.targetType');
    const c = get(this, 'model.targetPod.condition');
    return t === 'pod' && c === 'restarts';
  }.property('model.targetType', 'model.targetPod.condition'),

  displayTargetType: function() {
    const t = get(this, 'model.targetType');
    const intl = get(this, 'intl');
    return intl.t(`alertPage.targetTypes.${t}`);
    // if (t === 'pod') {
    //   return `Pod`;
    // }
    // if (t === 'workload') {
    //   return 'Workload';
    // }
    // if (t === 'workloadSelector') {
    //   return 'Workload Selector';
    // }
  }.property('model.targetType'),


  selectorList: function() {
    const t = get(this, 'model.targetType');
    if (t == 'workloadSelector') {
      const ary = Object
        .entries(get(this, 'model.targetWorkload.selector'))
        .map(([k, v]) => `${k}=${v}`)
      return ary;
    }
    return [];
  }.property('model.targetType'),

  selectorListTip: function() {
    const list = get(this, 'selectorList');
    const out = list.map(item => {
      return `<div class="p-5 text-left"><span class="badge bg-default badge-sm" style="border-radius:2px;"> ${item} </span></div>`
    }).join('');
    return htmlSafe(out);
  }.property('selectorList'),
});
