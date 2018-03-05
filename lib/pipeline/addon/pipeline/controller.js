import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  queryParams: ['mode'],
  mode:'',
  growl: service(),
  stagges: function() {
    var pipeline = this.get('model.pipeline');
    return pipeline.stages
  }.property('model'),
  filteredPipelineHistory: function(){
    let pipelineHistory = this.get('model.pipelineHistory');
    let pipeline = this.get('model.pipeline');
    if(!pipelineHistory){
      return;
    }
    let filteredPipelineHistory = pipelineHistory
      .filter(ele => ele.pipeline.id === pipeline.id)
        .sort((a,b) => b.get('startedTimeStamp') - a.get('startedTimeStamp'));
    return filteredPipelineHistory;
  }.property('model.pipelineHistory.[]', 'model.pipeline'),
  editable: function(){
    let mode = this.get('mode');
    return (mode !== 'review');
  }.property('mode'),
  actions: {
    save: function(success) {
      var model = this.get('model');
      var errors = model.pipeline.validationErrors();
      if (errors.length > 0) {
        this.set('errors', errors)
        success(false)
        return
      }
      var mode = this.get('mode');
      (()=>{
        if(mode==='duplicate'){
          return model.pipeline.save();
        }
        return model.pipeline.save(model.pipeline.serialize());
      })()
      .then(() => {
        success(true)
        this.set('errors',null);
        this.transitionToRoute('pipelines')
      }).catch((err)=>{
        this.get('growl').fromError(err.message);
      }).finally(()=>{
        success(false)
      })
    },
    cancel: function() {
      this.set('errors',null);
      window.history.back();
    }
  }
});
