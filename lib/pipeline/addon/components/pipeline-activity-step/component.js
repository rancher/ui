import Component from '@ember/component';
import {once} from '@ember/runloop';
import { set, get, computed } from '@ember/object';

export default Component.extend({
  dateNow: null,
  dateInterval: null,

  didInsertElement(){
    this._super(...arguments);
    once(()=>{
      var interval = window.setInterval(()=>{
        set(this, 'dateNow',Date.now())
      },1000);
      set(this, 'dateInterval',interval);
    });
  },
  willDestroyElement(){
    this._super(...arguments);
    var interval = get(this, 'dateInterval');
    interval&&window.clearInterval(interval);
  },
  displayState: computed('step.state', function () {
    return `generic.${get(this, 'step.state')}`;
  }),
  actions: {
    showLogs: function(stageIndex,stepIndex){
      this.sendAction('showLogsActivity',get(this, 'activity'), stageIndex,stepIndex)
    },
  }
});
