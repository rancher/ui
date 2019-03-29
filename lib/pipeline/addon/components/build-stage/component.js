import Component from '@ember/component';
import { on } from '@ember/object/evented';
import C from 'shared/utils/pipeline-constants';
import { set, get, computed, observer } from '@ember/object';

export const STATUS_INTL_KEY = 'accordionRow.status';

export default Component.extend({
  name:        null,
  title:       null,
  detail:      null,
  status:      null,
  statusClass: null,
  activity:    null,

  classNames: ['accordion'],
  expanded:   false,
  expandAll:  false,
  intent:     null,

  actions: {
    showLogs(stageIndex, stepIndex) {
      if ( !get(this, 'notRun') ) {
        if (this.logKeyChanged) {
          this.logKeyChanged(stageIndex, stepIndex);
        }
      }
    },
  },

  index: computed('stageIndex', function() {
    return get(this, 'stageIndex') + 1;
  }),

  notRun: computed('activity.executionState', 'status', function() {
    return get(this, 'activity.executionState') === C.STATES.FAILED && !get(this, 'status');
  }),

  waiting: computed('status', function() {
    return get(this, 'status') === C.STATES.WAITING || !get(this, 'status');
  }),

  building: computed('status', function() {
    return get(this, 'status') === C.STATES.BUILDING;
  }),

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
