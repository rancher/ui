import Component from '@ember/component';
import { set, get, observer, setProperties } from '@ember/object';
import C from 'shared/utils/pipeline-constants';
import layout from './template';

export default Component.extend({
  layout,

  activity: null,

  fullscreen: false,

  logIndex: {
    stageIndex: -1,
    stepIndex:  -1,
  },

  init() {
    this._super(...arguments);
    if ( get(this, 'activity.executionState') === C.STATES.WAITING ){
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
    toggleLogMode() {
      set(this, 'fullscreen', !get(this, 'fullscreen'));
    }
  },

  currentStepDidChange: observer('activity.stages.@each.state', function() {
    const stages = get(this, 'activity.stages');
    const runningStage = stages.findIndex((ele) => ele.state === C.STATES.BUILDING);

    if (runningStage === -1) {
      const waitingStage = stages.findIndex((ele) => ele.state === C.STATES.WAITING);

      if ( waitingStage === 0 ) {
        this.showLogsActivity(-1, -1);
      }

      return;
    }
    const runningStep = stages[runningStage].steps.findIndex((ele) => ele.state === C.STATES.BUILDING);

    if (runningStep === -1) {
      return;
    }
    this.showLogsActivity(runningStage, runningStep);
  }),

  showLogsActivity(stageIndex, stepIndex) {
    setProperties(get(this, 'logIndex'), {
      stageIndex,
      stepIndex,
    });
  },

});
