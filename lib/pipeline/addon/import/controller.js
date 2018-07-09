import Controller from '@ember/controller';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';

var validationErrors = function(pipeline){

  var errors = []

  if (!pipeline.templates) {

    return errors.push('"yml file" is required')

  }

  return errors

};

export default Controller.extend(NewOrEdit, {
  growl:   service(),
  scope:   service(),
  error:     null,
  editing:   false,
  compose:   null,
  files:     null,
  init() {

    this._super(...arguments);

  },

  actions: {
    save(success){

      let projectId = get(this, 'scope').currentProject.id;

      set(this, 'model.pipeline.projectId', projectId);
      set(this, 'model.pipeline.templates', { 'pipeline.yaml': get(this, 'compose') });
      var model = get(this, 'model')
      var errors = validationErrors(model.pipeline)

      if (errors.length > 0){

        set(this, 'errors', errors)
        success(false)

        return

      }
      model.pipeline.save().then(() => {

        success(true)
        this.transitionToRoute('pipelines');

      })
        .catch((err) => {

          get(this, 'growl').fromError(err.message);

          return success(false)

        })

    },
    cancel(){

      this.transitionToRoute('pipelines');

    }
  },
});
