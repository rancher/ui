import { get } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import notifierMixin from 'ui/mixins/notifier';
import { computed } from '@ember/object';

export default Component.extend(notifierMixin, {
  intl:        service(),

  model:             null,
  tagName:           '',
  subMatches:        null,
  expanded:          null,
  bulkActions:       true,

  actions: {
    toggle() {
      if (this.toggle) {
        this.toggle();
      }
    },
  },
  selectorList: computed('model.targetType', function() {
    const t = get(this, 'model.targetType');

    if (t === 'nodeSelector') {
      const ary = Object.entries(get(this, 'model.nodeRule.selector')).map(([k, v]) => `${ k }=${ v }`)

      return ary;
    }

    return [];
  }),

  selectorListTip: computed('selectorList', function() {
    const list = get(this, 'selectorList');
    const out = list.map((item) => {
      return `<div class="p-5 text-left"><span class="badge bg-default badge-sm" style="border-radius:2px;"> ${ item } </span></div>`
    }).join('');

    return htmlSafe(out);
  }),

  alertGroup: computed('groups', function() {
    const alertGroups = get(this, 'groups')
    const groupId = get(this, 'model.groupId')

    return alertGroups.filter((a) => groupId === a.id)[0]
  }),
});
