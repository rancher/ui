import Component from '@ember/component'
import { all as PromiseAll } from 'rsvp';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import layout from './template';
import $ from 'jquery';

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
  settings:    service(),
  globalStore: service(),

  layout,
  user:            null,
  mode:            null,
  allRoles:        null,
  _boundSave:      null,
  _boundValidator: null,

  init() {
    this._super(...arguments);

    set(this, 'allRoles', this.globalStore.all('globalRole'));

    this.initRoles();

    if (this.mode === 'new') {
      this.populateDefaultRoles();
    }

    setProperties(this, {
      '_boundSave':      this.save.bind(this),
      '_boundValidator': this.confirmUserCanLogIn.bind(this),
    });

    this.setSave(this._boundSave);
    this.setGRValidator(this._boundValidator);
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

  make(role) {
    return this.globalStore.createRecord({
      type:         'globalRoleBinding',
      globalRoleId: get(role, 'id'),
      userId:       get(this, 'user.id'),
      subjectKind:  'User',
    });
  },

  save() {
    set(this, 'errors', null);
    const add      = [];
    const remove   = [];
    const allRoles = [...this.baseRoles, ...this.additionalRoles];

    add.pushObjects(allRoles.filterBy('active').filterBy('existing', false).map((r) => this.make(r.role)));

    remove.pushObjects(allRoles.filterBy('active', false).filterBy('existing').map((r) => r.existing));

    return PromiseAll(add.map((x) => x.save())).then(() => {
      return PromiseAll(remove.map((x) => x.delete())).then(() => {
        return true;
      });
    });
  },

  initRoles() {
    const { allRoles, user }                                   = this;
    const { globalRoleBindings: usersGlobalRoleBindings = [] } = user;
    const visibleRoles                                         = allRoles.filterBy('isHidden', false);
    const baseRoles                                            = [ADMIN, USER, BASE].map((spr) => allRoles.findBy('id', spr))

    setProperties(this, {
      baseRoles:       baseRoles.map(roleMapper),
      additionalRoles: visibleRoles.map(roleMapper),
    });

    function roleMapper(role) {
      const binding                 = usersGlobalRoleBindings.findBy('globalRole', role) || false;
      let translationKey            = null;
      let descriptionTranslationKey = null;

      if ( baseRoles.findBy('id', role.id) ) {
        let roleMatch = LOGIN_ACCESS_ROLES.findBy('name', role.id);

        ({ translationKey, descriptionTranslationKey } = roleMatch);
      }

      return {
        role,
        translationKey,
        descriptionTranslationKey,
        active:   !!binding,
        existing: binding,
      }
    }
  },

  confirmUserCanLogIn() {
    const rolesThatCanLogIn = [ADMIN, USER, BASE];
    const allRoles          = [...this.baseRoles, ...this.additionalRoles];
    let roles               = allRoles.filterBy('active').map((r) => r.role);

    return roles.any((role) => {
      return rolesThatCanLogIn.includes(role.id);
    })
  },

  populateDefaultRoles() {
    this.baseRoles.forEach((r) => {
      if (r.role && r.role.id === 'user') {
        set(r, 'active', true);
      }
    });

    this.additionalRoles.forEach((r) => {
      if (r.role && r.role.newUserDefault) {
        set(r, 'active', true);
      }
    });
  }
});
