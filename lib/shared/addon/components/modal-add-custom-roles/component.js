import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set, setProperties } from '@ember/object';
import { alias } from 'ember-computed';
import { observer } from '@ember/object';
import { on } from '@ember/object/evented';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['small-modal'],
  type: alias('modalOpts.type'),
  mode: null,

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
    setProperties(this, {
      custom: custom,
      mode: 'custom',
      stdUser: `${get(this, 'type')}-member`,
      admin: `${get(this, 'type')}-owner`,
      cTyped: get(this, 'type').capitalize()
    });
  },

  modeWatch: on('init', observer('mode', function() {
    if (get(this, 'mode') && get(this, 'mode') !== 'custom') {
      get(this, 'custom').forEach((c) => set(c, 'active', false));
    }
  })),

  actions: {
    save() {
      let customs = get(this, 'custom');
      if (get(this, 'mode') === 'custom') {
        //check if active exists in custom if not throw error
      } else {
        set(this, 'modalOpts.model.role.roleTemplateId', get(this, 'mode'));
        // set(this, 'modalOpts.model.toAdd', true);
        let out = get(this, 'modalOpts.roles').findBy('id', get(this, 'mode'));
        customs.pushObject({
          active: false,
          existing: false,
          fromCustomToNon: true,
          role: out
        });

      }
      get(this, 'modalOpts.done')(get(this, 'custom'));
      this.get('modalService').toggleModal();
    },

    completed() {
      this.get('modalService').toggleModal();
    },

    goBack() {
      get(this, 'modalOpts.modalCanceled')(get(this, 'modalOpts.model'));
      this.get('modalService').toggleModal();
    },
  },
});
