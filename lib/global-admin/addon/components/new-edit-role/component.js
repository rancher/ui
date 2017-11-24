import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';

const ruleVerbs = C.RULE_VERBS.map(verb => `rolesPage.new.form.allow.${verb}`);

export default Component.extend(NewOrEdit, {
  intl: service(),
  router: service(),
  model: null,

  primaryResource: alias('model.role'),
  ruleArray: alias('model.role.rules'),
  roleArray: null,
  ruleVerbs,
  roleType: null,

  actions: {
    cancel() {
      this.goBack();
    },
    addRule() {
      this.get('ruleArray').pushObject({
        apiGroups: ['*'],
        type: 'policyRule',
        resources: [],
        verbs: [],
      });
    },
    addOtherRole() {
      this.get('roleArray').pushObject({
        value: '',
      });
    },
    removeRule(obj) {
      this.get('ruleArray').removeObject(obj);
    },
    removeOtherRole(obj) {
      this.get('roleArray').removeObject(obj);
    },
  },

  goBack: function() {
    const route = this.get('roleType') === 'project' ? '/admin/roles' : '/admin/roles?type=cluster'
    this.get('router').transitionTo(route);
  },

  init: function () {
    this._super();
    this.set('roleArray', (this.get(`primaryResource.${this.get('roleType')}RoleTemplateIds`) || []).map(r => {
      return {
        value: r
      };
    }));
  },

  otherRoles: function () {
    return this.get('model.roles').filter(role => this.get('model.role.name') !== role.id);
  }.property('model'),

  roleDidChange: function () {
    const role = this.get('model.role');
    role.set(`${this.get('roleType')}RoleTemplateIds`, (this.get('roleArray') || []).filter(r => r.value).map(r => r.value));
  }.observes('roleArray.@each.value'),

  doesNameExist() {
    const role = this.get('primaryResource');
    const currentRoles = this.get('model.roles');

    if (currentRoles.findBy('name', role.get('name'))) {
      return true;
    }

    return false;
  },

  doseRulesInvalid() {
    const rules = this.get('ruleArray');
    return rules.any(r => r.resources.length === 0);
  },

  validate: function () {
    var errors = this.get('errors', errors) || [];

    if ((this.get('model.role.name') || '').trim().length === 0) {
      errors.push(this.get('intl').findTranslationByKey('rolesPage.new.errors.nameReq'));
    }

    if (!this.get('editing') && this.doesNameExist()) {
      errors.push(this.get('intl').findTranslationByKey('rolesPage.new.errors.nameInExists'));
    }

    if (this.doseRulesInvalid()) {
      errors.push(this.get('intl').findTranslationByKey('rolesPage.new.errors.ruleResourceReq'));
    }

    if (errors.length) {
      this.set('errors', errors.uniq());
      return false;
    }
    else {
      this.set('errors', null);
    }

    return true;
  },

  willSave() {
    let ok = this._super(...arguments);
    if (ok) {
      const templateIdsKey = `${this.get('roleType')}RoleTemplateIds`;
      const role = this.get('primaryResource');
      const name = (role.get('name') || '').trim().toLowerCase();
      const otherRoles = role.get(templateIdsKey).filter(r => r).uniq();
      role.set('name', name);
      role.set(templateIdsKey, otherRoles);
    }
    return ok;
  },

  doneSaving() {
    this.goBack();
  },
});