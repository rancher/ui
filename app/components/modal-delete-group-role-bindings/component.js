import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'ui/mixins/modal-base';
import layout from './template';
import { next } from '@ember/runloop';

export default Component.extend(ModalBase, {
  settings:       service(),
  intl:           service(),
  growl:          service(),

  layout,
  classNames:     ['medium-modal'],

  mappedGroupRoleBindingNamesIds: alias('modalService.modalOpts.model.mappedGroupRoleBindingNamesIds'),

  actions: {
    save(cb) {
      next(() => {
        this.modalService.modalOpts.model.removeRoleBindings(cb).then(() => {
          this.send('cancel');
        });
      });
    },
  },
});
