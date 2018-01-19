import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';
import layout from './template';

const ruleVerbs = C.RULE_VERBS.map(verb => `rolesPage.new.form.allow.${verb}`);

export default Component.extend(NewOrEdit, {
  layout,
  intl: service(),
  router: service(),
  model: null,

  primaryResource: alias('model.role'),
  ruleArray: null,
  roleArray: null,
  readOnly: null,
  ruleVerbs,

  init: function () {
    this._super(...arguments);

    const ruleArray = [];

    (this.get('primaryResource.rules')||[]).forEach((rule) => {
      ruleArray.push(rule);
    });

    const roleArray = (this.get('primaryResource.roleTemplateIds')||[]).map((id) => {
      return { roleId: id };
    });


    this.setProperties({
      ruleArray,
      roleArray,
    });
  },

  actions: {
    cancel() {
      this.goBack();
    },

    addRule() {
      this.get('ruleArray').pushObject({
        apiGroups: ['*'],
        type: 'policyRule',
        resource: null,
        resources: [],
        verbs: [],
      });
    },

    removeRule(obj) {
      this.get('ruleArray').removeObject(obj);
    },

    addOtherRole() {
      this.get('roleArray').pushObject({
        roleId: null,
      });
    },

    removeOtherRole(obj) {
      this.get('roleArray').removeObject(obj);
    },

  },

  goBack() {
    this.get('router').transitionTo('global-admin.security.roles.index');
  },

  otherRoles: function () {
    return this.get('model.roles').filter(role => this.get('model.role.id') !== role.id);
  }.property('model.role.id','model.roles.@each.id'),

  validate() {
    this._super();
    var errors = this.get('errors', errors)||[];

    if ((this.get('primaryResource.name')||'').trim().length === 0) {
      errors.push(this.get('intl').findTranslationByKey('rolesPage.new.errors.nameReq'));
    }

    this.set('errors', errors);
    return this.get('errors.length') === 0;
  },

  willSave() {
    const role = this.get('model.role');
    const actualRules = [];

    // Create the actual rules
    const rules = this.get('ruleArray');
    let obj;
    for ( let i = rules.length - 1; i >= 0 ; i-- ) {
      obj = rules[i];
      if ( obj.resources.length && obj.verbs.length ) {
        actualRules.push({
          type: obj.type,
          apiGroups: obj.apiGroups.slice(),
          verbs: obj.verbs.slice(),
          resources: obj.resources.slice(),
        });
      } else {
        rules.removeObject(obj);
      }
    }

    role.set('rules', actualRules);

    // Add roles
    const roles = this.get('roleArray')
    for ( let i = roles.length - 1; i >= 0 ; i-- ) {
      obj = roles[i];
      if ( !obj.roleId ) {
        roles.removeObject(obj);
      }
    }

    role.set('roleTemplateIds', roles.map(obj => obj.roleId));

    return this._super(...arguments);
  },

  doneSaving() {
    this.goBack();
  },
});
