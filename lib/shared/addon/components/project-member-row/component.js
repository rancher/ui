import Component from '@ember/component';
import layout from './template';
import { computed, get, observer, set, setProperties } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';

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

  init() {
    this._super(...arguments);

    // so if the user thinks they want to add a custom role to a template that isn't custom we can reset the correct roleTemplateId on modal cancel
    let notCustom = get(this, 'member.customRolesExisting') ? false : true;
    if (notCustom) {
      set(this, '_customRole', get(this, 'member.role.roleTemplateId'));
    }
  },

  actions: {
    showEdit(member) {
      if (get(member, 'role.roleTemplateId') === 'custom'){
        this.openModal();
      } else {
        set(member, 'role.roleTemplateId', 'custom');
      }
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

  doneAdding(customs) {
    let customIds = [];
    let customIdsRemove = [];
    let fromCustomToNon = [];

    customs.forEach((c) => {
      if (get(c, 'active') && !get(c, 'existing')) {
        customIds.push(get(c, 'role.id'));
      }
      if (get(c, 'existing') && !get(c, 'active')) {
        customIdsRemove.push(get(c, 'role.id'));
      }
      if (get(c, 'fromCustomToNon')) {
        fromCustomToNon.push(get(c, 'role.id'));
      }
    });

    if (customIds.length > 0) {
      // we have customs
      setProperties(this, {
        hasCustom: true,
        customRoles: customs
      });
    }

    if ((customIds.length <= 0 && customIdsRemove.length > 0) || fromCustomToNon.length > 0) {
      //not adding just removing
      setProperties(this, {
        hasCustom: false,
        customRoles: []
      });
    }

    this.alertNewCustoms(get(this, 'member'), customIds, customIdsRemove, fromCustomToNon);
  },


  openModal() {
    let current = null;
    if (get(this, 'member.customRolesExisting')) {
      current = get(this, `resource.${get(this, 'pageType')}RoleTemplateBindings`);
    }
    get(this,'modalService').toggleModal('modal-add-custom-roles', {
      current:       current,
      done:          this.doneAdding.bind(this),
      editng:        get(this, 'editing'),
      modalCanceled: this.modalCanceled.bind(this),
      model:         get(this, 'member'),
      roles:         get(this, 'roles'),
      type:          get(this, 'pageType'),
    });
  },

  openCustomModal: on('init', observer('member.role.roleTemplateId', function() {
    if (get(this, 'member.role.roleTemplateId') === 'custom') {
      this.openModal();
    }
  })),

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

  showMxRoleLabel: computed('hasCustom', 'member.customRolesExisting.[]', 'customRoles.[]', 'member', function() {
    return ( get(this, 'hasCustom') || get(this, 'member.customRolesExisting.length') ) && !get(this, 'member.toAdd') && !get(this, 'member.fromCustomToNon') ? true : false;
  }),

});
