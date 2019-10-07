import Errors from 'ui/utils/errors';
import Component from '@ember/component'
import { all as PromiseAll } from 'rsvp';
import { inject as service } from '@ember/service';
import { computed, get, set, setProperties } from '@ember/object';
import layout from './template';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { next } from '@ember/runloop';
import $ from 'jquery';

const CUSTOM = 'custom';

export default Component.extend(NewOrEdit, {
  globalStore: service(),
  intl:        service(),
  scope:       service(),

  layout,
  user:            null,
  primaryResource: null,

  editing:   false,
  type:      null,
  cTyped:    null,
  stdUser:   null,
  admin:     null,
  principal: null,

  init() {
    this._super(...arguments);

    let model = { type: `${ get(this, 'type') }RoleTemplateBinding`, };

    set(model, `${ get(this, 'type') }Id`, get(this, `model.${ get(this, 'type') }.id`))

    setProperties(this, {
      primaryResource: this.make(model),
      stdUser:         `${ get(this, 'type') }-member`,
      admin:           `${ get(this, 'type') }-owner`,
      cTyped:          get(this, 'type').capitalize(),
    });
  },

  didInsertElement() {
    next(() => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      const elem = $('INPUT')[0]

      if ( elem ) {
        setTimeout(() => {
          elem.focus();
        }, 250);
      }
    });
  },

  actions: {
    gotError(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },
    addAuthorized(principal) {
      set(this, 'principal', principal);
    },
    cancel() {
      if (this.cancel) {
        this.cancel();
      }
    },
    save(cb) {
      set(this, 'errors', null);
      let mode = get(this, 'mode');
      let add = [];
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
      case `${ get(this, 'type') }-owner`:
      case `${ get(this, 'type') }-member`:
      case 'read-only':
        set(pr, 'roleTemplateId', mode);
        add = [pr];
        break;
      case CUSTOM:
        add = get(this, 'customToAdd').map((x) => {
          let neu = get(this, 'primaryResource').clone();

          set(neu, 'roleTemplateId', get(x, 'role.id'));

          return neu;
        });
        break;
      default:
        var addMatch = userRoles.find((ur) => get(ur, 'active'));

        if (addMatch) {
          set(pr, 'roleTemplateId', get(addMatch, 'role.id'));
          add = [pr];
        }

        break;
      }


      if (!this.validate()) {
        if ( cb ) {
          cb();
        }

        return;
      }

      return PromiseAll(add.map((x) => x.save())).then(() => this.doneSaving())
        .catch((err) => {
          set(this, 'errors', [Errors.stringify(err)]);

          return cb(false);
        });
    },

  },

  showAdmin: computed('model.roles.@each.id', 'mode', function() {
    const id = `${ get(this, 'type') }-owner`;
    const role = get(this, 'model.roles').findBy('id', id);

    if ( get(this, 'mode') === id ) {
      return true;
    }

    if ( role && get(role, 'locked') !== true ) {
      return true;
    }

    return false;
  }),

  showStdUser: computed('model.roles.@each.id', 'mode', function() {
    const id = `${ get(this, 'type') }-member`;
    const role = get(this, 'model.roles').findBy('id', id);

    if ( get(this, 'mode') === id ) {
      return true;
    }

    if ( role && get(role, 'locked') !== true ) {
      return true;
    }

    return false;
  }),

  showReadOnly: computed('model.roles.@each.id', 'mode', function() {
    const id = 'read-only';
    const role = get(this, 'model.roles').findBy('id', id);

    if ( get(this, 'mode') === id ) {
      return true;
    }

    if ( role && get(role, 'locked') !== true ) {
      return true;
    }

    return false;
  }),


  baseRoles: computed(function() {
    return [
      `${ get(this, 'type') }-admin`,
      `${ get(this, 'type') }-owner`,
      `${ get(this, 'type') }-member`,
      'read-only'
    ];
  }),

  userRoles: computed('model.roles.[]', function() {
    let roles = get(this, 'model.roles');
    let userDef = roles.filter((role) => !get(role, 'builtin')
        && !get(role, 'external')
        && !get(role, 'hidden')
        && (get(role, 'context') === get(this, 'type') || !get(role, 'context')));

    return userDef.map((role) => {
      return {
        role,
        active: false,
      }
    });
  }),

  custom: computed('model.roles.[]', function() {
    // built in
    let roles  = get(this, 'model.roles').filterBy('hidden', false);
    let excludes = get(this, 'baseRoles');
    let context = `${ get(this, 'type') }`;

    return roles.filter((role) => !excludes.includes(role.id)
        && get(role, 'builtin')
        && get(role, 'context') === context).map((role) => {
      return {
        role,
        active: false,
      }
    });
  }),

  mode: computed('editing',  {
    get() {
      let mode = null;

      const memberId = `${ get(this, 'type') }-member`;
      const memberRole = get(this, 'model.roles').findBy('id', memberId);
      const ownerId = `${ get(this, 'type') }-owner`;
      const onwerRole = get(this, 'model.roles').findBy('id', ownerId);

      if ( memberRole ) {
        mode = memberId;
      } else if ( get(this, 'userRoles.length') ) {
        const userRole = get(this, 'userRoles.firstObject');

        set(userRole, 'active', true);
        mode = userRole;
      } else if ( onwerRole ) {
        mode = ownerId;
      } else {
        mode = CUSTOM;
      }

      return mode;
    },
    set(key, value) {
      if (typeof value === 'object') {
        const ur = get(this, 'userRoles').findBy('active', true);

        if ( ur ) {
          set(ur, 'active', false);
        }
        set(value, 'active', true);
        // value = get(value, 'role.id');
        // return get(value, 'role.id');
      } else {
        let ur = get(this, 'userRoles').findBy('active', true);

        if (ur) {
          next(() => {
            set(ur, 'active', false)
          })
        }
      }

      return value;
    },
  }),

  customToAdd: computed('custom.@each.active', function() {
    return get(this, 'custom').filter( (role) => get(role, 'active') );
  }),

  make(role) {
    return get(this, 'globalStore').createRecord(role);
  },

  validate() {
    var errors = this.get('errors', errors) || [];

    let principal = get(this, 'principal');

    if ( !principal ) {
      errors.push(this.get('intl').t('rolesPage.new.errors.memberReq'));
      set(this, 'errors', errors);

      return false;
    }

    const current = (get(this, 'model.roleBindings') || []).filter((role) => {
      let id;

      if ( get(this, 'type') === 'project' ) {
        id = get(this, 'scope.currentProject.id');
      } else {
        id = get(this, 'scope.currentCluster.id');
      }

      return id === get(role, `${ get(this, 'type') }Id`) && get(role, 'userPrincipalId') === get(principal, 'id');
    });

    if (get(this, 'mode') === 'custom') {
      if (get(this, 'customToAdd.length') < 1) {
        errors.push(this.get('intl').t('rolesPage.new.errors.noSelectedRoles'));
      }
      (get(this, 'customToAdd') || []).forEach((add) => {
        if ( current.findBy('roleTemplateId', get(add, 'role.id')) ) {
          errors.push(this.get('intl').t('rolesPage.new.errors.roleAlreadyExists', { key: get(add, 'role.displayName') }));
        }
      });
    } else if ( current.findBy('roleTemplateId', get(this, 'primaryResource.roleTemplateId')) ) {
      errors.push(this.get('intl').t('rolesPage.new.errors.roleAlreadyExists', { key: get(this, 'primaryResource.roleTemplate.displayName') }));
    }

    set(this, 'errors', errors);

    return this.get('errors.length') === 0;
  },

});
