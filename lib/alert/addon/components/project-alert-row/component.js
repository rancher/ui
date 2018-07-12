import { get } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import notifierMixin from 'alert/mixins/notifier';

export default Component.extend(notifierMixin, {
  intl:        service(),
  model:       null,
  tagName:     'TR',
  classNames:  'main-row',
  bulkActions: true,


  isRestartCondition: function() {

    const t = get(this, 'model.targetType');
    const c = get(this, 'model.targetPod.condition');

    return t === 'pod' && c === 'restarts';

  }.property('model.targetType', 'model.targetPod.condition'),

  selectorList: function() {

    const t = get(this, 'model.targetType');

    if (t === 'workloadSelector') {

      const ary = Object
        .entries(get(this, 'model.targetWorkload.selector'))
        .map(([k, v]) => `${ k }=${ v }`)

      return ary;

    }

    return [];

  }.property('model.targetType'),

  selectorListTip: function() {

    const list = get(this, 'selectorList');
    const out = list.map((item) => {

      return `<div class="p-5 text-left"><span class="badge bg-default badge-sm" style="border-radius:2px;"> ${ item } </span></div>`

    }).join('');

    return htmlSafe(out);

  }.property('selectorList'),
});
