import Component from '@ember/component';
import { once } from '@ember/runloop';
import { set, get, computed } from '@ember/object';

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
        this.sendAction('logKeyChanged', stageIndex, stepIndex);
      }
    },
  },

  waiting: computed('step.state', function() {
    return get(this, 'step.state') === 'Waiting' || get(this, 'step.state') === 'Skipped' || !get(this, 'step.state');
  }),

  building: computed('step.state', function() {
    return get(this, 'step.state') === 'Building';
  }),

  notRun: computed('activity.executionState', 'step.state', function() {
    return get(this, 'activity.executionState') === 'Failed' && !get(this, 'step.state');
  }),

});
