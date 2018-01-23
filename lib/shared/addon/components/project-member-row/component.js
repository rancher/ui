import Component from '@ember/component';
import layout from './template';
import { computed, get, observer, set, setProperties } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service';

const BASIC_ROLES = [
  {
    label: 'Standard User',
    value: 'member',
  },
  {
    label: 'Admin',
    value: 'owner',
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
  customRoles: null,

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
    }
  },

  doneAdding(customs) {
    setProperties(this, {
      hasCustom: true,
      customRoles: customs
    });
    let customIds = [];
    let customIdsRemove = [];
    customs.forEach((c) => {
      if (get(c, 'active') && !get(c, 'existing')) {
        customIds.push(get(c, 'role.id'));
      }
      if (get(c, 'existing') && !get(c, 'active')) {
        customIdsRemove.push(get(c, 'role.id'));
      }
    });
    this.alertNewCustoms(get(this, 'member'), customIds, customIdsRemove);
  },

  openModal() {
    let current = null;
    if (get(this, 'member.customRolesExisting')) {
      current = get(this, `resource.${get(this, 'pageType')}RoleTemplateBindings`);
    }
    // append roletemplate ids from the modal to the custom field. split that field in the add promise of form-members?
    get(this,'modalService').toggleModal('modal-add-custom-roles', {
      model: get(this, 'member'),
      roles: get(this, 'roles'),
      done: this.doneAdding.bind(this),
      current: current,
      type: get(this, 'pageType')
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

  kind: computed('member.role.subjectKind', function () {
    if (get(this, 'owner')) {
      return `projectsPage.new.form.members.${get(this,'owner.type').toLowerCase()}`; // TODO translations
    } else {
      return `projectsPage.new.form.members.${get(this,'member.role.subjectKind').toLowerCase()}`
    }
  }),

});
