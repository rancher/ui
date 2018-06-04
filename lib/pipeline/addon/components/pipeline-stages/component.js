import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import C from 'shared/utils/pipeline-constants';

export default Component.extend({
  modalService: service('modal'),

  model:          null,
  pipeline:       null,
  selectedConfig: null,
  actions:        {
    addStage() {
      get(this, 'modalService').toggleModal('modal-pipeline-new-stage', {
        save: (stage) => {
          var stages = get(this, 'selectedConfig.stages');

          stages.pushObject(stage);
          get(this, 'modalService').toggleModal();
        }
      })
    },
    editStage(index) {
      const stage = get(this, 'selectedConfig.stages').get(index);

      get(this, 'modalService').toggleModal('modal-pipeline-new-stage', {
        stage: Object.assign({}, stage),
        save:  (stage) => {
          get(this, 'selectedConfig.stages').replace(index, 1, [stage]);
          get(this, 'modalService').toggleModal();
        },
        remove: () => {
          get(this, 'selectedConfig.stages').replace(index, 1);
          get(this, 'modalService').toggleModal();
        },
      })
    }
  },
  envvars: C.ENV_VARS,
});