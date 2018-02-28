import Component from '@ember/component';

export default Component.extend({
  stepObserves: function(){
    let step = this.get('step');
    console.log(step);
  }.observes('step.{state}'),
  stepsObserves: function(){
    let step = this.get('step');
    console.log(step);
  }.observes('step.state'),
  actions: {
    showLogs: function(stageIndex,stepIndex){
      this.sendAction('showLogsActivity',this.get('activity'), stageIndex,stepIndex)
    },
  }
});
