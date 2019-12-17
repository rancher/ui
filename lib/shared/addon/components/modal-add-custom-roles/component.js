import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set, setProperties, computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['small-modal'],
  mode:       null,
  errors:     null,

  type:            alias('modalOpts.type'),
  current:         alias('modalOpts.current'),
  isCurrentCustom: alias('modalOpts.isCustom'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      mode:   'custom',
      cTyped: get(this, 'type').capitalize()
    });
  },

  actions: {
    save(cb) {
      let customroles = get(this, 'filteredRoles').filter((c) => get(c, 'active')).map((r) => get(r, 'role.id'));

      if (get(this, 'mode') !== 'custom') {
        customroles.push(get(this, 'mode')); // from custom to non
      }

      if (customroles.length > 0) {
        set(this, 'errors', null);
        get(this, 'modalOpts.done')(customroles);
        this.get('modalService').toggleModal();
      } else {
        set(this, 'errors', ['You must choose a role for this member before closing the modal.'])

        return cb(false);
      }
    },

    completed() {
      this.get('modalService').toggleModal();
    },

    goBack() {
      get(this, 'modalOpts.modalCanceled')();
      this.get('modalService').toggleModal();
    },

    toggle(e) {
      const $target = $(e.target); // eslint-disable-line
      const $row = $target.closest('.input-group');
      const check = $('input[type=checkbox]', $row)[0]; // eslint-disable-line

      if ( check && e.target !== check && e.target.tagName !== 'LABEL' ) {
        check.checked = !check.checked;
      }
    }
  },
  filteredRoles: computed('modalOpts.roles', function() {
    return get(this, 'modalOpts.roles').filterBy('isCustom').map((role) => {
      let binding = null;

      if ( get(this, 'modalOpts.current.length') ) {
        binding = get(this, 'modalOpts.current').includes(get(role, 'id')) ? role : null;
      }

      return {
        role,
        active:   !!binding,
        existing: binding,
      }
    });
  }),

  roleTemplateId: computed({
    get(key) {
      if (get(this, 'mode') === 'custom') {
        return 'custom';
      } else {
        return `${ get(this, 'type') }-${ key }`;
      }
    },
    set(key, value) {
      if (value === 'custom') {
        return set(this, 'mode', 'custom');
      } else {
        get(this, 'filteredRoles').forEach((c) => set(c, 'active', false));

        return set(this, 'mode', `${ get(this, 'type') }-${ value }`);
      }
    }
  }),

});
