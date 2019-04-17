import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { alias } from '@ember/object/computed';
import { set } from '@ember/object';
import { isArray } from '@ember/array';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['large-modal', 'alert'],
  mode:       alias('modalOpts.mode'),

  actions: {
    errorHandler(err, shouldClearPreviousErrors = false) {
      let { errors } = this;

      if (shouldClearPreviousErrors) {
        errors = set(this, 'errors', []);
      }

      if (errors) {
        if (isArray(err)) {
          errors.pushObjects(err);
        } else {
          errors.pushObject(err);
        }
      } else {
        errors = [err];
      }

      set(this, 'errors', errors);
    },
  },

});
