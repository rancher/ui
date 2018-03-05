import Component from '@ember/component';
import {once} from '@ember/runloop';

export default Component.extend({
  stepObserves: function(){
    let step = this.get('step');
    console.log(step);
  }.observes('step.{state}'),
  stepsObserves: function(){
    let step = this.get('step');
    console.log(step);
  }.observes('step.state'),
  dateNow: null,
  dateInterval: null,
  didInsertElement(){
    this._super(...arguments);
    once(()=>{
      var interval = window.setInterval(()=>{
        this.set('dateNow',Date.now())
      },1000);
      this.set('dateInterval',interval);
    });
  },
  willDestroyElement(){
    this._super(...arguments);
    var interval = this.get('dateInterval');
    interval&&window.clearInterval(interval);
  },
  actions: {
    showLogs: function(stageIndex,stepIndex){
      this.sendAction('showLogsActivity',this.get('activity'), stageIndex,stepIndex)
    },
  }
});
