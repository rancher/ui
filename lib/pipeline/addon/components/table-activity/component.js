import Component from '@ember/component';
import EmberObject from '@ember/object';
import { get, set } from '@ember/object';

export default Component.extend({
  model: null,
  expandFn: function(item) {
    item.toggleProperty('expanded');
  },
  logStatus:[],
  init(){
    this._super();
  },
  setLogStatus: function(){
    let logStatus = [];
    var activity_stages = get(this, 'filteredPipelineHistory');
    activity_stages.forEach(ele=>{
      let initialStepIndex = 0;
      let initialStageIndex = 0;
      if(ele.executionState === 'Waiting'){
        initialStepIndex = -1;
        initialStageIndex = -1;
      }
      logStatus.addObject(EmberObject.create({
        activity: ele,
        stepIndex: initialStepIndex,
        stageIndex: initialStageIndex,
        activityLogs: EmberObject.create({}),
      }));
    });
    set(this, 'logStatus', logStatus);
  },
  activityStatusObserve: function(){
    var activity_stages = get(this, 'filteredPipelineHistory');
    let logStatus = get(this, 'logStatus');
    for (var i = 0; i < activity_stages.length; i++) {
      var item = activity_stages[i];
      if(item.executionState === 'Waiting'){
        logStatus.length&&logStatus.objectAt(i).setProperties({
          stepIndex: -1,
          stageIndex: -1,
          'activityLogs': EmberObject.create({})
        });
      }
    }
  }.observes('filteredPipelineHistory.@each.executionState'),
  didInsertElement(){
    this.setLogStatus();
  }
});
