import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get } from '@ember/object';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['medium-modal', 'alert'],

  errors: [],

  model: alias('modalService.modalOpts.originalModel'),

  actions: {
    save(cb) {
      get(this, 'model').save()
        .then(() => {
          this.send('cancel');
        })
        .finally(() => {
          cb();
        });
    },
  }
});
