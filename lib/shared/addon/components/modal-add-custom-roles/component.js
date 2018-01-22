import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set } from '@ember/object';
import { alias } from 'ember-computed';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['small-modal'],
  type: alias('modalOpts.type'),

  init() {
    this._super(...arguments);
    let custom = get(this, 'modalOpts.roles').filterBy('hidden', false).filter((role) => {
      return role.get('id') !== `${get(this, 'type')}-owner` && role.get('id') !== `${get(this, 'type')}-member`;
    }).map((role) => {
      let binding = null;
      if ( get(this, 'modalOpts.current') ) {
        binding = get(this, 'modalOpts.current').findBy('roleTemplateId', get(role, 'id'));
      }
      return {
        role,
        active: !!binding,
        existing: binding,
      }
    });
    set(this, 'custom', custom)
  },

  actions: {
    save() {
      get(this, 'modalOpts.done')(get(this, 'custom'));
      this.get('modalService').toggleModal();
    },

    completed() {
      this.get('modalService').toggleModal();
    },

    goBack() {
      this.get('modalService').toggleModal();
    },
  },
});
