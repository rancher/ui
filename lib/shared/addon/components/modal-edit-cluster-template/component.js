import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import NewOrEdit from 'shared/mixins/new-or-edit';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { set } from '@ember/object';

export default Component.extend(ModalBase, NewOrEdit, {
  modal:      service(),

  layout,
  classNames: ['large-modal'],

  primaryResource:         alias('modal.modalOpts.model'),
  originalPrimaryResource: alias('modal.modalOpts.model'),

  actions: {
    addAuthorizedPrincipal(member) {
      let { members = [] } = this.primaryResource;

      if (!members) {
        members = [];
      }

      if (member) {
        members.pushObject(this.globalStore.createRecord(member));
      } else {
        members.pushObject(this.globalStore.createRecord({ type: 'member' }));
      }

      set(this, 'primaryResource.members', members);
    },

    removeAuthorizedPrincipal(member) {
      let { members } = this.primaryResource;

      members.removeObject(member);
    },

    cancel() {
      this.modal.toggleModal();
    },
  },

  doneSaving() {
    this.modal.toggleModal();
  },
});
