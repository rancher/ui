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

    // so if the user thinks they want to add a custom role to a template that isn't custom we can reset the correct roleTemplateId on modal cancel
    let notCustom = get(this, 'member.customRolesExisting') ? false : true;
    if (notCustom) {
      set(this, '_customRole', get(this, 'member.role.roleTemplateId'));
    }
  },

  actions: {
    showEdit() {
      this.openModal();
    },
    remove: function () {
      this.sendAction('remove', get(this,'member'));
    },
  },

  modalCanceled(member) {
    // TODO 2.0 this works but the select component isn't updating correctly
    set(member, 'role.roleTemplateId', get(this, '_customRole'));
    set(this, '_customRole', null);
  },

  doneAdding(customs, normalRole=null) {
    let customIds = [];
    let customIdsRemove = [];

    if (normalRole && normalRole !== 'custom') {
      customIds.push(normalRole);
      // TODO How to set this with out actually setting? use case when users go from custom to normal it will still show "Custom Roles" in the ui
      // set(this, 'role.roleTemplateId', normalRole);
      set(this, 'fromCustom', true);
      set(this, 'member.toUpdate', false);
    }

    customs.forEach((c) => {
      if (get(c, 'active') && !get(c, 'existing')) {
        customIds.push(get(c, 'role.id'));
      }
      if (get(c, 'existing') && !get(c, 'active')) {
        customIdsRemove.push(get(c, 'role.id'));
      }
    });

    if (customIds.length > 0 && !normalRole) {
      // we have customs
      setProperties(this, {
        hasCustom: true,
        customRoles: customs,
        fromCustom: false,
      });
    }

    this.alertNewCustoms(get(this, 'member'), customIds, customIdsRemove);
  },


  openModal() {
    let current = null;
    if (get(this, 'member.customRolesExisting') || get(this, 'member.deleteBasicRole')) {
      current = get(this, `resource.${get(this, 'pageType')}RoleTemplateBindings`).filterBy('creatorId');
    }
    get(this,'modalService').toggleModal('modal-add-custom-roles', {
      current:       current,
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

        if (!get(this, 'member.toAdd')) {
          setProperties(this, {
            'member.deleteBasicRole': true,
            'member.toUpdate': false,
          });

        }
        next(() => {
          this.openModal();
        });

        return get(this, `role.${key}`);
      }

      return set(this, `role.${key}`, value);
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
