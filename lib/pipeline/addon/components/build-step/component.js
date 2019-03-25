import Component from '@ember/component';
import { once } from '@ember/runloop';
import { set, get, computed } from '@ember/object';
import C from 'shared/utils/pipeline-constants';

export default Component.extend({
  dateNow:      null,
  dateInterval: null,

  didInsertElement() {
    this._super(...arguments);
    once(() => {
      var interval = window.setInterval(() => {
        set(this, 'dateNow', Date.now())
      }, 1000);

      set(this, 'dateInterval', interval);
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    var interval = get(this, 'dateInterval');

    interval && window.clearInterval(interval);
  },

  actions: {
    showLogs(stageIndex, stepIndex) {
      if ( !get(this, 'notRun') ) {
        if (this.logKeyChanged) {
          this.logKeyChanged(stageIndex, stepIndex);
        }
      }
    },
  },

  waiting: computed('step.state', function() {
    return get(this, 'step.state') === C.STATES.WAITING || get(this, 'step.state') === C.STATES.SKIPPED || !get(this, 'step.state');
  }),

  building: computed('step.state', function() {
    return get(this, 'step.state') === C.STATES.BUILDING;
  }),

  notRun: computed('activity.executionState', 'step.state', function() {
    return get(this, 'activity.executionState') === C.STATES.FAILED && !get(this, 'step.state');
  }),

});
