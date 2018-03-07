import Errors from 'ui/utils/errors';
import Component from '@ember/component'
import { all as PromiseAll } from 'rsvp';
import { inject as service } from '@ember/service';
import { computed, get, set, setProperties } from '@ember/object';
import layout from './template';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { next } from '@ember/runloop';

const CUSTOM = 'custom';

export default Component.extend(NewOrEdit,{
  layout,
  globalStore: service(),
  intl: service(),

  user: null,
  primaryResource: null,

  editing: false,
  type: null,
  cTyped: null,
  stdUser: null,
  admin: null,
  principal: null,

  baseRoles: computed(function () {
    return [
      `${get(this, 'type')}-admin`,
      `${get(this, 'type')}-owner`,
      `${get(this, 'type')}-member`,
    ];
  }),
  userRoles: computed('model.roles.[]', function() {
    let roles = get(this, 'model.roles');
    let current = get(this, 'defaultUser').get(`${get(this, 'type')}RoleBindings`);
    let userDef = roles.filter(role => {
      return !get(role, 'builtin')
        && !get(role, 'external')
        && !get(role, 'hidden');
    });
    return userDef.map((role) => {
      const binding = current.findBy('roleTemplateId', get(role, 'id')) || null;
      return {
        role,
        active: !!binding,
        existing: binding,
      }
    });
  }),

  custom: computed('model.roles.[]', function() {
    // built in
    let current = get(this, 'defaultUser').get(`${get(this, 'type')}RoleBindings`);
    let roles  = get(this, 'model.roles').filterBy('hidden', false);
    let excludes = get(this, 'baseRoles');
    let context = `${get(this, 'type')}`;
    return roles.filter(role => {
      return !excludes.contains(role.id)
        && get(role, 'builtin')
        && get(role, 'context') === context;
    }).map((role) => {
      const binding = current.findBy('roleTemplateId', get(role, 'id')) || null;
      return {
        role,
        active: !!binding,
        existing: binding,
      }
    });
  }),

  mode: computed('editing','defaultUser',  {
    get() {
      let editing = get(this, 'editing');
      let dfu = get(this, 'defaultUser');
      let current = dfu.get(`${get(this, 'type')}RoleBindings`);
      let mode = null;

      if (editing && current.length === 1) {
        mode = get(current, 'firstObject.roleTemplateId');
      } else if (editing && current.length > 1){
        mode = CUSTOM;
      } else {
        mode = `${get(this, 'type')}-member`;
      }

      return mode;
    },
    set(key, value) {
      if (typeof value === 'object') {
        set(value, 'active', true);
        // value = get(value, 'role.id');
        // return get(value, 'role.id');
      } else {
        // debugger;
        let ur = get(this, 'userRoles').findBy('active', true);
        if (ur) {
          next(() => {set(ur, 'active', false)})
        }
      }

      return value;
    },
  }),

  init() {
    this._super(...arguments);

    let dfu = get(this, 'defaultUser');
    let model = {
      type: `${get(this, 'type')}RoleTemplateBinding`,
    };

    set(model, `${get(this, 'type')}Id`, get(this, `model.${get(this, 'type')}.id`))

    setProperties(this, {
      primaryResource: this.make(model),
      defaultUser: dfu,
      stdUser: `${get(this, 'type')}-member`,
      admin: `${get(this, 'type')}-owner`,
      cTyped: get(this, 'type').capitalize()
    });
  },

  make(role) {
    return get(this, 'globalStore').createRecord(role);
  },

  validate() {
    var errors = this.get('errors', errors) || [];

    if (get(this, 'mode') === 'custom') {
      if (get(this, 'customToAdd.length') < 1) {
        errors.push(this.get('intl').findTranslationByKey('rolesPage.new.errors.roleTemplate'));
      }
    } else {
      if (!get(this, 'primaryResource.roleTemplateId')) {
        errors.push(this.get('intl').findTranslationByKey('rolesPage.new.errors.roleTemplate'));
      }
    }

    this.set('errors', errors);
    return this.get('errors.length') === 0;
  },

  customToAdd: computed(function() {
    return get(this, 'custom').filterBy('active',true ).filterBy('existing',null);
  }),
  customToRemove: computed(function() {
    return get(this, 'custom').filterBy('active',false).filterBy('existing');
  }),


  actions: {
    gotError: function(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },
    addAuthorized: function(principal) {
      set(this, 'principal', principal);
    },
    cancel() {
      this.sendAction('cancel');
    },
    save(cb) {
      let mode = get(this, 'mode');
      let add = [];
      let remove = [];
      let pr = get(this, 'primaryResource');
      const userRoles = get(this, 'userRoles');
      let principal = get(this, 'principal');

      if (principal) {
        if (get(principal, 'principalType') === 'user') {
          set(pr, 'userPrincipalId', get(principal, 'id'))
        } else if (get(principal, 'principalType') === 'group') {
          set(pr, 'groupPrincipalId', get(principal, 'id'))
        }
      }

      switch ( mode ) {
      case `${get(this, 'type')}-owner`:
      case `${get(this, 'type')}-member`:
        set(pr, 'roleTemplateId', mode);
        add = [ pr ];
        break;
      case CUSTOM:
        add = get(this, 'customToAdd').map((x) => {
          let neu = get(this, 'primaryResource').clone();
          set(neu, 'roleTemplateId', get(x, 'role.id'));
          return neu;
        });
        remove = get(this, 'customToRemove').map(y => y.existing);
        break;
      default:
        var addMatch =userRoles.find((ur) => {
          return get(ur, 'active') && !get(ur, 'existing');
        });
        var removeMatch = userRoles.find((ur) => {
          return !get(ur, 'active') && get(ur, 'existing');
        });
        if (addMatch) {
          set(pr, 'roleTemplateId', get(addMatch, 'role.id'));
          add = [ pr ];
        }

        if (removeMatch) {
          remove = [ get(removeMatch, 'existing')];
        }
        break;
      }


      if(!this.validate()) {
        if ( cb ) {
          cb();
        }
        return;
      }

      return PromiseAll(add.map(x => x.save())).then(() => {
        return PromiseAll(remove.map(x => x.delete())).then(() => {
          return this.doneSaving();
        });
      });
    },

  }

});
