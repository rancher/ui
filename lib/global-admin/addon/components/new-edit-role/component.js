import { alias, or } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';
import { get, computed, set } from '@ember/object';
import { isEmpty } from '@ember/utils';
import ViewNewEdit from 'shared/mixins/view-new-edit';

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

export default Component.extend(ViewNewEdit, {
  intl:              service(),
  router:            service(),
  layout,
  model:             null,

  ruleArray:         null,
  roleArray:         null,
  readOnly:          null,
  roleType:          null,
  contexts:          BASIC_CONTEXT,
  mode:              'new',
  ruleVerbs,

  primaryResource:   alias('model.role'),
  readOnlyOrBuiltIn: or('readOnly', 'builtIn', 'isView'),

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
    return (get(this, 'roleType') || '').capitalize();
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

  ruleResources: computed('model.globalRoles.[]', 'model.roleTemplates.[]', function() {
    const {
      model: { globalRoles, roles: roleTemplates },
      roleType
    }                      = this;
    let groupedResourceRules;

    switch (roleType) {
    case 'global':
      if (!isEmpty(globalRoles)) {
        groupedResourceRules = this.getRuleResourceList(globalRoles);
      }
      break;
    default:
      if (!isEmpty(roleTemplates)) {
        groupedResourceRules = this.getRuleResourceList(roleTemplates.filterBy('context', roleType));
      }
      break;
    }

    return groupedResourceRules;
  }),

  getRuleResourceList(roles) {
    const groupedResourceRules = [];

    roles.forEach((role) => {
      if (!isEmpty(role.rules)) {
        // currently is ungrouped but can be grouped.
        // The problem is that these are just default resources in a particular role,
        // they are not unique so they show up duplicated under different groups.
        // we need some discussion whether this is okay or not
        // const group = role.name;

        role.rules.forEach((rule) => {
          if (!isEmpty(rule.resources)) {
            rule.resources.forEach((resource) => {
              if (resource !== '*') {
                groupedResourceRules.push({
                  // group,
                  label: resource,
                  value: resource
                });
              }
            });
          }
        });
      }
    });

    return groupedResourceRules.uniqBy('value').sortBy('label');
  },

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
      errors.push(get(this, 'intl').t('rolesPage.new.errors.nameReq'));
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
      if (( !isEmpty(obj.resources) || !isEmpty(obj.nonResourceURLs) ) && obj.verbs.length) {
        const resources = [];
        const out = {
          type:      obj.type,
          verbs:     obj.verbs.slice(),
        };

        if (!isEmpty(obj.apiGroups)) {
          out['apiGroups'] = obj.apiGroups.slice();
        }

        if (!isEmpty(obj.resources)) {
          obj.resources.forEach((r) => {
            resources.pushObjects((r || '').split(',').filter((r) => r));
          });

          out['resources'] = resources;
        } else if (!isEmpty(obj.nonResourceURLs)) {
          obj.nonResourceURLs.forEach((r) => {
            resources.pushObjects((r || '').split(',').filter((r) => r));
          });

          out['nonResourceURLs'] = resources;
        }

        actualRules.push(out);
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
