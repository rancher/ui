import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get, set, setProperties, computed } from '@ember/object';
import { alias } from 'ember-computed';

const ROLE_BASE = ['cluster-owner', 'cluster-member', 'project-owner', 'project-member'];

export default Component.extend(ModalBase, {
  layout,
  classNames: ['small-modal'],
  type: alias('modalOpts.type'),
  current: alias('modalOpts.current'),
  mode: null,
  readOnly: false,

  init() {
    this._super(...arguments);

    setProperties(this, {
      mode: 'custom',
      cTyped: get(this, 'type').capitalize()
    });

  },

  isCurrentCustom: computed('current.[]', function() {
    return (get(this, 'current')||[]).filter(x => !ROLE_BASE.includes(get(x, 'roleTemplateId')))
  }),

  filteredRoles: computed('modalOpts.roles', function() {
    return get(this, 'modalOpts.roles').filterBy('isCustom').map((role) => {
      let binding = null;

      if ( get(this, 'modalOpts.current.length') ) {
        binding = get(this, 'modalOpts.current').contains(get(role, 'id')) ? role : null;
      }

      return {
        role,
        active: !!binding,
        existing: binding,
      }
    });
  }),

  roleTemplateId: computed({
    get(key) {
      if (get(this, 'mode') === 'custom') {
        return 'custom';
      } else {
        return `${get(this, 'type')}-${key}`;
      }
    },
    set(key, value) {
      if (value === 'custom') {
        return set(this, 'mode', 'custom');
      } else {
        get(this, 'filteredRoles').forEach((c) => set(c, 'active', false));
        return set(this, 'mode', `${get(this, 'type')}-${value}`);
      }
    }
  }),

  actions: {
    save() {
      // let customroles = get(this, 'filteredRoles').filter(c => get(c, 'active') || get(c, 'existing')).map(r => get(r, 'role.id'));
      let customroles = get(this, 'filteredRoles').filter(c => get(c, 'active')).map(r => get(r, 'role.id'));
      if (get(this, 'mode') !== 'custom') {
        customroles.push(get(this, 'mode')); // from custom to non
      }
      get(this, 'modalOpts.done')(customroles);
      this.get('modalService').toggleModal();
    },

    completed() {
      this.get('modalService').toggleModal();
    },

    goBack() {
      // get(this, 'modalOpts.modalCanceled')(get(this, 'modalOpts.model'));
      this.get('modalService').toggleModal();
    },
  },
});
