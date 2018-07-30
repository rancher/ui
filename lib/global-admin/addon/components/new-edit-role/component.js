import { alias, equal, or } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';
import layout from './template';
import { get, computed, set } from '@ember/object';

const ruleVerbs = C.RULE_VERBS.map((verb) => `rolesPage.new.form.allow.${ verb }`);

const BASIC_CONTEXT = [
  {
    label: 'All',
    value: '',
  },
  {
    label: 'Project',
    value: 'project',
  },
  {
    label: 'Cluster',
    value: 'cluster',
  },
];

export default Component.extend(NewOrEdit, {
  intl:                    service(),
  router:                  service(),
  layout,
  model:                   null,

  ruleArray:               null,
  roleArray:               null,
  readOnly:                null,
  roleType:                null,
  contexts:                BASIC_CONTEXT,
  ruleVerbs,

  primaryResource:         alias('model.role'),
  isGlobal:                equal('roleType', 'global'),
  readOnlyBuiltInOrGlobal: or('readOnly', 'builtIn', 'isGlobal'),

  init() {
    this._super(...arguments);

    const ruleArray = [];
    const model = get(this, 'primaryResource');


    (get(model, 'rules') || []).filter((r) => (r.resources || r.nonResourceURLs)).forEach((rule) => {
      ruleArray.push(rule);
    });

    const roleArray = (get(model, 'roleTemplateIds') || []).map((id) => {
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
      get(this, 'ruleArray').pushObject({
        apiGroups: ['*'],
        type:      'policyRule',
        resource:  null,
        resources: [],
        verbs:     [],
      });
    },

    removeRule(obj) {
      get(this, 'ruleArray').removeObject(obj);
    },

    addOtherRole() {
      get(this, 'roleArray').pushObject({ roleId: null, });
    },

    removeOtherRole(obj) {
      get(this, 'roleArray').removeObject(obj);
    },

  },

  readableRole: computed('roleType', function() {
    return get(this, 'roleType').capitalize();
  }),

  isDefault: computed('roleType', {
    get(/* key */) {
      const model = get(this, 'model.role');
      const type  = get(this, 'roleType');
      const field = this.getDefaultField(type);

      return get(model, field);
    },
    set(key, value) {
      const model = get(this, 'model.role');
      const type  = get(this, 'roleType');
      const field = this.getDefaultField(type);

      return model.set(field, value);
    }
  }),

  builtIn: computed('model.role.builtin', function() {
    return get(this, 'model.role.builtin') === true;
  }),

  otherRoles: computed('model.role.id', 'model.roles.@each.id', function() {
    return get(this, 'model.roles').filter((role) => get(this, 'model.role.id') !== role.id);
  }),

  getDefaultField(type) {
    let out = '';

    switch (type) {
    case 'global':
      out = 'newUserDefault';
      break;
    case 'cluster':
      out = 'clusterCreatorDefault';
      break;
    case 'project':
      out = 'projectCreatorDefault';
      break;
    default:
      break;
    }

    return out;
  },

  goBack() {
    get(this, 'router').transitionTo('global-admin.security.roles.index', { queryParams: { context: get(this, 'roleType') } });
  },

  validate() {
    this._super();
    var errors = get(this, 'errors') || [];

    if ((get(this, 'primaryResource.name') || '').trim().length === 0) {
      errors.push(get(this, 'intl').findTranslationByKey('rolesPage.new.errors.nameReq'));
    }

    set(this, 'errors', errors);

    return get(this, 'errors.length') === 0;
  },

  willSave() {
    const role = get(this, 'model.role');
    const actualRules = [];

    // Create the actual rules
    const rules = get(this, 'ruleArray');
    let obj;

    for (let i = rules.length - 1; i >= 0; i--) {
      obj = rules[i];
      if (obj.resources && obj.resources.length && obj.verbs.length) {
        const resources = [];

        obj.resources.forEach((r) => {
          resources.pushObjects((r || '').split(',').filter((r) => r));
        });

        actualRules.push({
          type:      obj.type,
          apiGroups: obj.apiGroups.slice(),
          verbs:     obj.verbs.slice(),
          resources,
        });
      } else {
        rules.removeObject(obj);
      }
    }

    role.set('rules', actualRules);

    // Add roles
    const roles = get(this, 'roleArray')

    for (let i = roles.length - 1; i >= 0; i--) {
      obj = roles[i];
      if (!obj.roleId) {
        roles.removeObject(obj);
      }
    }

    role.set('roleTemplateIds', roles.map((obj) => obj.roleId));

    return this._super(...arguments);
  },

  doneSaving() {
    this.goBack();
  },
});
