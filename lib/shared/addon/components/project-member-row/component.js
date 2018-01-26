import Component from '@ember/component';
import layout from './template';
import { computed, get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';

const BASIC_ROLES = [
  {
    label: 'Owner',
    value: 'owner',
  },
  {
    label: 'Member',
    value: 'member',
  },
  {
    label: 'Custom',
    value: 'custom',
  },
];

const ROLE_BASE = ['cluster-owner', 'cluster-member', 'project-owner', 'project-member'];

export default Component.extend({
  layout,
  tagName:    'TR',
  classNames: 'main-row',

  member:     null,
  roles:      null,
  owner: null,
  type:  null,
  pageType: null,
  modalService: service('modal'),
  hasCustom: false,
  editing: false,
  customRoles: null,
  _customRole: null,
  globalStore: service(),
  role: alias('member.role'),

  init() {
    this._super(...arguments);

    if (get(this, 'member.memberId')) {
    }

    if (get(this, 'member.bindings.length') > 1)  {
      set(this, 'hasCustom', true);
    }

    if (get(this, 'member.bindings.length') === 1) {
      set(this, 'roleTemplateId', get(this, 'member.bindings.firstObject'));
    }

  },

  actions: {
    showEdit() {
      this.openModal();
    },
  },

  modalCanceled(member) {
    // TODO 2.0 this works but the select component isn't updating correctly
    set(member, 'role.roleTemplateId', get(this, '_customRole'));
    set(this, '_customRole', null);
  },

  doneAdding(customs) {
    // let memberBindings = get(this, 'member.bindings');
    ROLE_BASE.forEach((role) => {
      if (customs.includes(role)) {
        set(this, 'hasCustom', false);
        // how do I set role template id here without breaking every thing? otherwise it just shows custom roles
      }
    });
    set(this, 'member.bindings', customs);
    // set(this, 'member.bindings', memberBindings.concat(customs));
  },


  openModal() {
    get(this,'modalService').toggleModal('modal-add-custom-roles', {
      current:       get(this, 'member.bindings'),
      done:          this.doneAdding.bind(this),
      editng:        get(this, 'editing'),
      readOnly:      !get(this, 'member.toAdd'),
      modalCanceled: this.modalCanceled.bind(this),
      model:         get(this, 'member'),
      roles:         get(this, 'roles'),
      type:          get(this, 'pageType'),
    });
  },

  roleTemplateId: computed({
    get(key) {
      return get(this, `role.${key}`);
    },
    set(key, value) {

      if (value === 'custom') {
        next(() => {
          this.openModal();
        });

        return get(this, `role.${key}`);
      }

      set(this, 'member.bindings', [ value ])
      return value;
    }
  }),

  choices: computed('roles.[]', 'pageType', function() {
    let pt = get(this, 'pageType');
    if (pt) {
      return BASIC_ROLES.map((r) => {
        return {
          label: r.label,
          value: r.value.indexOf('custom') >= 0 ? 'custom' : `${pt}-${r.value}`
        };

      });
    }
    return [];
  }),

  userList: computed('users.[]', function() {
    return (get(this, 'users')||[]).map(( user ) =>{
      return {
        label: get(user, 'displayName'),
        value: get(user, 'id')
      };
    });
  }),

  showMxRoleLabel: computed('hasCustom', 'member.customRolesExisting.[]', 'customRoles.[]', 'member', 'role.roleTemplateId', function() {
    return  get(this, 'hasCustom') || (  get(this, 'member.customRolesExisting.length') && !get(this, 'member.toAdd')  && !get(this, 'fromCustom') );
  }),

});
