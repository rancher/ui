import Component from '@ember/component';

export default Component.extend({
  init(){
    this._super();
    this.set('activityLogs', {});
  },
  runningObserves: function(){
    var stages = this.get('activity.stages');
    var runningStage = stages.findIndex(ele=>ele.state==='Building');
    if(runningStage === -1){
      return
    }
    var runningStep = stages[runningStage].steps.findIndex(ele=>ele.state==='Building');
    if(runningStep === -1) {
      return
    }
    this.get('logModel').setProperties({
      'stageIndex': runningStage,
      'stepIndex': runningStep
    });
  }.observes('activity.stages.@each.stepStates'),
  logModel: function(){
    return this.get('logStatus')[this.get('index')];
  }.property('logStatus.@each.{stageIndex,stepIndex,activityLogs}','index'),
  actions: {
    showLogsActivity: function(model,stageIndex,stepIndex){
      this.get('logModel').setProperties({
        'stageIndex': stageIndex,
        'stepIndex': stepIndex
      });
    },
  }
});
