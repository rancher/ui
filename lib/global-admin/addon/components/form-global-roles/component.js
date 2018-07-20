import Component from '@ember/component'
import { all as PromiseAll } from 'rsvp';
import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';
import layout from './template';
import { on } from '@ember/object/evented';

const USER = 'user';
const ADMIN = 'admin';
const CUSTOM = 'custom';

export default Component.extend({
  settings:    service(),
  globalStore: service(),

  layout,
  user:        null,

  mode:        null,
  allRoles:    null,
  custom:      null,

  _boundSave:  null,

  init() {
    this._super(...arguments);

    const all       = set(this, 'allRoles', get(this, 'globalStore').all('globalRole'));
    const user      = get(this, 'user');
    const hasCustom = !!get(user, 'globalRoleBindings').map((x) => get(x, 'globalRole')).findBy('isCustom');
    const current   = get(user, 'globalRoleBindings');

    let mode        = CUSTOM;

    if ( get(user, 'hasAdmin') ) {
      mode = ADMIN;
    } else if ( (!get(user, 'id') || get(user, 'hasUser')) && !hasCustom ) {
      mode = USER;
    }

    set(this, 'mode', mode);


    set(this, 'custom', all.filterBy('isHidden', false).map((role) => {
      const binding = current.findBy('globalRole', role) || null;

      return {
        role,
        active:   !!binding,
        existing: binding,
      }
    }));

    set(this, '_boundSave', this.save.bind(this));

    get(this, 'setSave')(get(this, '_boundSave'));
  },

  actions: {
    toggle(e) {
      const $target = $(e.target); // eslint-disable-line
      const $row = $target.closest('.input-group');
      const check = $('input[type=checkbox]', $row)[0]; // eslint-disable-line

      if ( check && e.target !== check && e.target.tagName !== 'LABEL' ) {
        check.checked = !check.checked;
      }
    }
  },

  unsetCustom: on('init', observer('mode', function() {
    if (get(this, 'mode') !== 'custom') {
      get(this, 'custom').forEach((c) => {
        set(c, 'active', false);
      });
    }
  })),

  make(role) {
    return get(this, 'globalStore').createRecord({
      type:         'globalRoleBinding',
      globalRoleId: get(role, 'id'),
      userId:       get(this, 'user.id'),
      subjectKind:  'User',
    });
  },

  save() {
    this.set('errors', null);
    let add         = [];
    let remove      = [];

    const user      = get(this, 'user');
    const custom    = get(this, 'custom');
    const baseRole  = get(this, 'allRoles').findBy('isBase', true);
    const userRole  = get(this, 'allRoles').findBy('isUser', true);
    const adminRole = get(this, 'allRoles').findBy('isAdmin', true);
    const mode      = get(this, 'mode');

    switch ( mode ) {
    case ADMIN:

      remove = custom.filterBy('existing').filter((x) => {
        return get(x, 'role.isUser') || get(x, 'role.isBase') || get(x, 'role.isCustom');
      }).map((x) => x.existing);

      if ( !get(user, 'hasAdmin') ) {
        add.push(this.make(adminRole));
      }
      break;

      // Admin intentionally doesn't remove any roles

    case USER:
      remove = custom.filterBy('existing').filter((x) => {
        return get(x, 'role.isAdmin') || get(x, 'role.isBase') || get(x, 'role.isCustom');
      }).map((x) => x.existing);

      if ( !get(user, 'hasUser') ) {
        add.push(this.make(userRole))
      }
      break;

    case CUSTOM:
      add    = custom.filterBy('active', true ).filterBy('existing', null).map((x) => this.make(x.role));
      remove = custom.filterBy('active', false).filterBy('existing').map((y) => y.existing);

      if ( !get(user, 'hasBase') ) {
        add.push(this.make(baseRole));
      }
      break;
    }

    // Remove the standard roles, but don't remove anything for admins
    const bindings = get(user, 'globalRoleBindings');

    if ( mode !== ADMIN) {
      remove.pushObjects(bindings.filterBy('globalRole.isAdmin'));

      if ( mode !== USER) {
        remove.pushObjects(bindings.filterBy('globalRole.isUser'));
      }

      if ( mode !== CUSTOM) {
        remove.pushObjects(bindings.filterBy('globalRole.isBase'));
      }
    }

    return PromiseAll(add.map((x) => x.save())).then(() => {
      return PromiseAll(remove.map((x) => x.delete())).then(() => {
        return true;
      });
    });
  },
});
