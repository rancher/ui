import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({ 
  growl: service(),
  errors: null,
  saved: false,
  actions: {
    save: function(success){
      var model = this.get('model');
      var errors=model.pipeline.validationErrors();
      if(errors.length>0){
        this.set('errors',errors);
        success(false);
        return
      }
      model.pipeline.save().then(()=>{
        success(true);
        this.set('saved', true);
        this.transitionToRoute('pipelines');
      }).catch((err)=>{
        this.get('growl').fromError(err.message);
      }).finally(()=>{
        success(false);
      })
    },
    cancel: function(){
      this.transitionToRoute('pipelines');
    }
  }
});
