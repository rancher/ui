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
    if (t === 'systemService') {
      return intl.t('alertPage.index.table.displayCondition.unhealthy');
    }
    if (t === 'event') {
      return intl.t('alertPage.index.table.displayCondition.happens');
    }
    if (t === 'node' || t === 'nodeSelector') {
      const c = get(this, 'model.targetNode.condition');
      if (c === 'notready') {
        return intl.t('alertPage.index.table.displayCondition.notReady');
      }
      if (c === 'cpu') {
        const n = get(this, 'model.targetNode.cpuThreshold');
        return intl.t('alertPage.index.table.displayCondition.cpuUsage', {percent: n});
      }
      if (c === 'mem') {
        const n = get(this, 'model.targetNode.memThreshold');
        return intl.t('alertPage.index.table.displayCondition.memUsage', {percent: n});
      }
    }
    return intl.t('alertPage.na');
  }.property('model.targetType', 'model.targetNode.{condition,cpuThreshold,memThreshold}'),

  resourceKind: function() {
    const rk = get(this, 'model.targetEvent.resourceKind');
    return get(this, 'intl').t(`alertPage.targetTypes.${rk}`);

  }.property('model.targetEvent.resourceKind'),
  displayTargetType: function() {
    const t = get(this, 'model.targetType');
    const intl = get(this, 'intl');
    return intl.t(`alertPage.targetTypes.${t}`);
    // if (t === 'systemService') {
    //   return intl.t('ser')
    //   return 'System Service';
    // }
    // if (t === 'node') {
    //   return 'Node';
    // }
    // if (t === 'nodeSelector') {
    //   return 'Node Selector';
    // }
    // if (t === 'event') {
    //   return 'Event';
    // }
    // return 'n/a';
  }.property('model.targetType'),

  selectorList: function() {
    const t = get(this, 'model.targetType');
    if (t == 'nodeSelector') {
      const ary = Object
            .entries(get(this, 'model.targetNode.selector'))
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
