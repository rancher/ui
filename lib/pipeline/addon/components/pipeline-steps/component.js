import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';

export default Component.extend({
  modalService: service('modal'),

  steps:             null,
  pipeline:          null,
  stages:            null,
  currentStageIndex: null,

  isScm: computed('steps.[]', function() {

    return !!get(this, 'steps.firstObject.sourceCodeConfig');

  }),

  actions: {
    addStep() {

      get(this, 'modalService').toggleModal('modal-pipeline-new-step', {
        save: (step) => {

          get(this, 'steps').pushObject(step);

        },
        projectDockerCredentials: get(this, 'projectDockerCredentials')
      });

    },

    editStep(index) {

      const step = get(this, 'steps').get(index);

      get(this, 'modalService').toggleModal('modal-pipeline-new-step', {
        save: (step) => {

          get(this, 'steps').replace(index, 1, [step]);

        },
        remove: () => {

          get(this, 'steps').replace(index, 1);

        },
        step:                     Object.assign({}, step),
        projectDockerCredentials: get(this, 'projectDockerCredentials')
      });

    }
  },

});
