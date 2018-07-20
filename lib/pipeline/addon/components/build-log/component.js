import Component from '@ember/component';
import {
  get, observer, set
} from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  activity: null,

  logIndex: {
    stageIndex: -1,
    stepIndex:  -1,
  },

  currentStepDidChange: observer('activity.stages.@each.state', function() {

    const stages = get(this, 'activity.stages');
    const runningStage = stages.findIndex((ele) => ele.state === 'Building');

    if (runningStage === -1) {

      const waitingStage = stages.findIndex((ele) => ele.state === 'Waiting');

      if ( waitingStage === 0 ) {

        this.showLogsActivity(-1, -1);

      }

      return;

    }
    const runningStep = stages[runningStage].steps.findIndex((ele) => ele.state === 'Building');

    if (runningStep === -1) {

      return;

    }
    this.showLogsActivity(runningStage, runningStep);

  }),

  init() {

    this._super(...arguments);
    if ( get(this, 'activity.executionState') === 'Waiting' ){

      this.showLogsActivity(-1, -1);

    } else {

      this.showLogsActivity(0, 0);

    }
    this.currentStepDidChange();

  },

  actions: {
    logKeyChanged(stageIndex, stepIndex) {

      this.showLogsActivity(stageIndex, stepIndex);

    },
  },

  showLogsActivity(stageIndex, stepIndex) {

    set(this, 'logIndex.stageIndex', stageIndex);
    set(this, 'logIndex.stepIndex', stepIndex);

  },

});
