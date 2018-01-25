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

    let custom = get(this, 'modalOpts.roles').filterBy('hidden', false).filter((role) => {

      return !ROLE_BASE.includes(get(role, 'id'))

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
      cTyped: get(this, 'type').capitalize()
    });

  },

  isCurrentCustom: computed('current.[]', function() {
    return (get(this, 'current')||[]).filter(x => !ROLE_BASE.includes(get(x, 'roleTemplateId')))
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
        get(this, 'custom').forEach((c) => set(c, 'active', false));
        return set(this, 'mode', `${get(this, 'type')}-${value}`);
      }
    }
  }),

  actions: {
    save() {
      get(this, 'modalOpts.done')(get(this, 'custom'), get(this, 'mode'));
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
