import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default Controller.extend({
  growl:   service(),
  errors:  null,
  saved:   false,
  actions: {
    save(success){

      var model = get(this, 'model');
      var errors = model.pipeline.validationErrors();

      if (errors.length > 0){

        set(this, 'errors', errors);
        success(false);

        return

      }
      model.pipeline.save().then(() => {

        success(true);
        set(this, 'saved', true);
        this.transitionToRoute('pipelines');

      })
        .catch((err) => {

          get(this, 'growl').fromError(err.message);

        })
        .finally(() => {

          success(false);

        })

    },
    cancel(){

      this.transitionToRoute('pipelines');

    }
  }
});
