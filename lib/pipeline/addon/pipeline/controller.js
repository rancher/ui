import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default Controller.extend({
  growl:       service(),
  queryParams: ['mode'],
  mode:        '',
  actions:     {
    save(success) {
      var model = get(this, 'model');
      var errors = model.pipeline.validationErrors();

      if (errors.length > 0) {
        set(this, 'errors', errors)
        success(false)

        return
      }
      var mode = get(this, 'mode');

      (() => {
        if (mode === 'duplicate'){
          return model.pipeline.save();
        }

        return model.pipeline.save(model.pipeline.serialize());
      })()
        .then(() => {
          success(true)
          set(this, 'errors', null);
          this.transitionToRoute('pipelines')
        }).catch((err) => {
          get(this, 'growl').fromError(err.message);
        }).finally(() => {
          success(false)
        })
    },
    cancel() {
      set(this, 'errors', null);
      window.history.back();
    }
  },
  stagges:     function() {
    var pipeline = get(this, 'model.pipeline');

    return pipeline.stages
  }.property('model'),
  filteredPipelineHistory: function(){
    let pipelineHistory = get(this, 'model.pipelineHistory');
    let pipeline = get(this, 'model.pipeline');

    if (!pipelineHistory){
      return;
    }
    let filteredPipelineHistory = pipelineHistory
      .filter((ele) => ele.pipeline.id === pipeline.id)
      .sort((a, b) => b.get('startedTimeStamp') - a.get('startedTimeStamp'));

    return filteredPipelineHistory;
  }.property('model.pipelineHistory.[]', 'model.pipeline'),
  editable: function(){
    let mode = get(this, 'mode');

    return (mode !== 'review');
  }.property('mode'),
});
