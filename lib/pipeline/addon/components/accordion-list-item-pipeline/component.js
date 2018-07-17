import Component from '@ember/component';
import { on } from '@ember/object/evented';
import { observer } from '@ember/object';
import { set, get } from '@ember/object';

export const STATUS_INTL_KEY = 'accordionRow.status';

export default Component.extend({
  name:        null,
  title:       null,
  detail:      null,
  status:      null,
  statusClass: null,

  classNames:   ['accordion'],
  expanded:     false,
  expandAll:    false,
  intent:       null,
  expdObserver: on('init', observer('expanded', function() {
    if (get(this, 'expanded') && !get(this, 'intent')) {
      set(this, 'intent', get(this, 'componentName'));
    }
  })),

  expandAllObserver: on('init', observer('expandAll', function() {
    var ea = get(this, 'expandAll');

    if (ea) {
      set(this, 'expanded', true);
    } else {
      set(this, 'expanded', false);
    }
  })),
});
