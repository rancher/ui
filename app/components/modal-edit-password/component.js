import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get/* , set */ } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend(ModalBase, {
  router:     service(),
  settings:   service(),
  layout,
  classNames: ['medium-modal'],
  showHelp:   false,
  user:       alias('modalOpts.user'),
  actions:    {
    complete(success) {
      if (success) {
        // get(this, 'router').replaceWith('authenticated');
        get(this, 'modalService').toggleModal();
      }
    },
    cancel() {
      get(this, 'modalService').toggleModal();
    },

    goBack() {
      get(this, 'modalService').toggleModal();
    },

  },
});
