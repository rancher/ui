import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { set, get } from '@ember/object';
import ModalBase from 'ui/mixins/modal-base';
import layout from './template';
import C from 'shared/utils/pipeline-constants';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['large-modal', 'alert', 'pipeline-new-step'],

  step:      null,
  editing:   null,

  modalOpts: alias('modalService.modalOpts'),

  init() {
    this._super(...arguments);

    let step = get(this, 'modalOpts.step');

    if ( step ) {
      const stepType = this.getStepType(step);

      set(step, 'type', stepType);
      set(this, 'step', step);
      set(this, 'editing', true);
    } else {
      step = {};
      set(step, 'type', C.STEP_TYPES[0].type);
      set(this, 'step', step);
    }
  },

  actions: {
    save(step) {
      get(this, 'modalOpts').save(step);
      get(this, 'modalService').toggleModal();
    },

    cancel() {
      get(this, 'modalService').toggleModal();
    },

    remove() {
      get(this, 'modalOpts').remove();
      get(this, 'modalService').toggleModal();
    },
  },

  getStepType(step) {
    let type = '';

    C.STEP_TYPES.forEach((stepType) => {
      if ( get(step, stepType.name) ) {
        type = stepType.type;
      }
    });

    return type;
  },
});
