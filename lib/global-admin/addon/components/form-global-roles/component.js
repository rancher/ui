import Component from '@ember/component'
import { all as PromiseAll } from 'rsvp';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import layout from './template';
import $ from 'jquery';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import { isArray } from '@ember/array';

const USER               = 'user';
const ADMIN              = 'admin';
const BASE               = 'user-base';
const LOGIN_ACCESS_ROLES = [
  {
    name:                      USER,
    translationKey:            'formGlobalRoles.mode.user.label',
    descriptionTranslationKey: 'formGlobalRoles.mode.user.detail',
  },
  {
    name:                      ADMIN,
    translationKey:            'formGlobalRoles.mode.admin.label',
    descriptionTranslationKey: 'formGlobalRoles.mode.admin.detail',
  },
  {
    name:                      BASE,
    translationKey:            'formGlobalRoles.mode.userBase.label',
    descriptionTranslationKey: 'formGlobalRoles.mode.userBase.detail',
  },
];

export default Component.extend({
  settings:         service(),
  globalStore:      service(),

  layout,
  user:             null,
  groupPrincipalId: null,
  mode:             null,
  allRoles:         null,
  _boundSave:       null,
  _boundValidator:  null,

  init() {
    this._super(...arguments);

    set(this, 'allRoles', this.globalStore.all('globalRole'));

    this.initRoles();

    this.initBindings();
  },

  actions: {
    toggle(e) {
      const $target = $(e.target);
      const $row    = $target.closest('.input-group');
      const check   = $('input[type =checkbox]', $row)[0];

      if ( check && e.target !== check && e.target.tagName !== 'LABEL' ) {
        check.click();
      }
    }
  },

  baseRoles: computed('allRoles.[]', function() {
    const { allRoles } = this;

    return [ADMIN, USER, BASE].map((r) => allRoles.findBy('id', r)).compact();
  }),

  make(role) {
    const out = this.globalStore.createRecord({
      type:         'globalRoleBinding',
      globalRoleId: get(role, 'id'),
    });

    if (!isEmpty(this.user)) {
      set(out, 'userId', this.user.id);
    }

    if (!isEmpty(this.groupPrincipalId)) {
      set(out, 'groupPrincipalId', this.groupPrincipalId);
    }

    return out;
  },

  save() {
    set(this, 'errors', null);
    const allRoles = [...this.baseRoles, ...this.additionalRoles, ...this.userRoles];
    // all active non-existant roles remapped to an array of the role resources for the save
    const add      = allRoles.filterBy('active').filterBy('existing', false).map((r) => this.make(r.role));
    // all inactive existing roles remapped to an array of the role resources for the remove save
    const remove   = allRoles.filterBy('active', false).filterBy('existing').map((r) => r.existing);

    return PromiseAll(add.map((x) => x.save())).then(() => {
      return PromiseAll(remove.map((x) => x.delete())).then(() => {
        return true;
      });
    });
  },

  initBindings() {
    if (!isEmpty(this.setSave)) {
      set(this, '_boundSave', this.save.bind(this));
      this.setSave(this._boundSave);
    }

    if (!isEmpty(this.setGRValidator)) {
      set(this, '_boundValidator', this.confirmUserCanLogIn.bind(this));
      this.setGRValidator(this._boundValidator);
    }
  },

  initBaseRoles() {
    set(this, 'baseRoles', this.baseRoles.map(this.roleMapper.bind(this)))
  },

  initRoles() {
    setProperties(this, {
      baseRoles:       this.baseRoles.map(this.roleMapper.bind(this)),
      additionalRoles: this.allRoles.filterBy('isHidden', false).filterBy('builtin').map(this.roleMapper.bind(this)),
      userRoles:       this.allRoles.filterBy('isHidden', false).filterBy('builtin', false).map(this.roleMapper.bind(this))
    });

    if (this.mode === 'new') {
      this.populateDefaultRoles();
    }
  },

  roleMapper(role) {
    const { user, groupGlobalRoleBindings = [] } = this;
    const usersGlobalRoleBindings           = [];
    let hasTranslation = true;

    if (!isEmpty(user)) {
      usersGlobalRoleBindings.pushObjects(user.globalRoleBindings.filterBy('groupPrincipalId', null));
    } else {
      usersGlobalRoleBindings.pushObjects(groupGlobalRoleBindings.slice());
    }

    const binding                 = usersGlobalRoleBindings.findBy('globalRole', role) || false;
    let translationKey            = null;
    let descriptionTranslationKey = null;

    if ( this.baseRoles.findBy('id', role.id) ) {
      let roleMatch = LOGIN_ACCESS_ROLES.findBy('name', role.id);

      ({ translationKey, descriptionTranslationKey } = roleMatch);
    } else {
      hasTranslation = false;
    }

    return {
      role,
      translationKey,
      descriptionTranslationKey,
      hasTranslation,
      active:   !!binding,
      existing: binding,
    }
  },

  confirmUserCanLogIn() {
    const allRoles    = [...this.baseRoles, ...this.additionalRoles, ...this.userRoles];
    let roles         = allRoles.filterBy('active').map((r) => r.role);
    let allRolesRules = [];

    roles.forEach((r) => {
      if (!isEmpty(r.rules)) {
        allRolesRules.pushObjects(r.rules);
      }
    });

    let matchingRules = allRolesRules.filter((rule) => {
      if (this.isRuleValid(rule)) {
        return rule;
      }

      return false;
    });

    if (isEmpty(matchingRules)) {
      return false;
    }

    return true;
  },

  isRuleValid(rule) {
    if (( rule.resources || [] ).any(resourceValidator) && ( rule.apiGroups || [] ).any(apiGroupValidator) && verbsValidator(( rule.verbs || [] ))) {
      return true;
    }

    return false;

    function resourceValidator(resource) {
      const resourcesRequiredForLogin = ['*', 'preferences', 'settings', 'features'];

      // console.log(`resourceValidator status: `, resourcesRequiredForLogin.includes(resource), resource);
      return resourcesRequiredForLogin.includes(resource);
    }

    function apiGroupValidator(apiGroup) {
      const apiGroupsRequiredForLogin = ['*', 'management.cattle.io'];

      // console.log(`apiGroupsRequiredForLogin status: `, apiGroupsRequiredForLogin.includes(apiGroup), apiGroup);
      return apiGroupsRequiredForLogin.includes(apiGroup);
    }

    function verbsValidator(verbs) {
      const restrictedTarget      = ['get', 'list', 'watch'];
      const verbsRequiredForLogin = ['*', ...restrictedTarget];

      if (isArray(verbs) && verbs.length > 1) {
        // console.log(`verbsRequiredForLogin status 1: `, restrictedTarget.every((rt) => verbs.includes(rt)), verbs);
        return restrictedTarget.every((rt) => verbs.includes(rt));
      }

      // console.log(`verbsRequiredForLogin status 2: `, verbsRequiredForLogin.includes(verbs), verbs);
      return verbsRequiredForLogin.includes(verbs.firstObject);
    }
  },

  populateDefaultRoles() {
    [...this.baseRoles, ...this.additionalRoles, ...this.userRoles].forEach((r) => {
      if (!isEmpty(r.role)) {
        if (r.role.id === 'user' || r.role.newUserDefault) {
          set(r, 'active', true);
        }
      }
    });
  }
});
