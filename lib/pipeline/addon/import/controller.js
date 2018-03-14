import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { inject as service } from '@ember/service';

var validationErrors = function(pipeline){
  var errors = []
  if (!pipeline.templates) {
    return errors.push('"yml file" is required')
  }
  return errors
};

export default Controller.extend(NewOrEdit, {
  error:     null,
  editing:   false,
  compose:   null,
  files:     null,
  growl: service(),
  scope: service(),
  init() {
    this._super(...arguments);
  },

  actions: {
    save: function(success){
      let projectId = this.get('scope').currentProjectId;
      this.set('model.pipeline.projectId', projectId);
      this.set('model.pipeline.templates',{
        "pipeline.yaml": this.get('compose')
      });
      var model = this.get('model')
      var errors=validationErrors(model.pipeline)
      if(errors.length>0){
        this.set('errors',errors)
        success(false)
        return
      }
      model.pipeline.save().then(()=>{
        success(true)
        this.transitionToRoute('pipelines');
      }).catch((err)=>{
        this.get('growl').fromError(err.message);
        return success(false)
      })
    },
    cancel: function(){
      this.transitionToRoute('pipelines');
    }
  },
});
