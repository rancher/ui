import Component from '@ember/component'
import { all as PromiseAll } from 'rsvp';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import layout from './template';

const USER = 'user';
const ADMIN = 'admin';
const CUSTOM = 'custom';

export default Component.extend({
  layout,
  settings: service(),
  globalStore: service(),

  user: null,

  mode: null,
  allRoles: null,
  custom: null,

  _boundSave: null,

  init() {
    this._super(...arguments);
    const all = get(this,'globalStore').all('globalRole');
    set(this, 'allRoles', all);

    const user = get(this, 'user');
    const hasCustom = !!get(user,'globalRoleBindings').map(x => get(x,'globalRole')).findBy('isCustom');
    let mode = CUSTOM;
    if ( get(user,'hasAdmin') ) {
      mode = ADMIN;
    } else if ( (!get(user,'id') || get(user,'hasBase')) && !hasCustom ) {
      mode = USER;
    }

    set(this, 'mode', mode);

    const current = user.get('globalRoleBindings');
    set(this, 'custom', all.filter((role) => {
      return !role.get('isHidden') && role.get('id') !== 'admin' && role.get('id') !== 'user';
    }).map((role) => {
      const binding = current.findBy('globalRole', role) || null;
      return {
        role,
        active: !!binding,
        existing: binding,
      }
    }));

    set(this, '_boundSave', this.save.bind(this));

    this.sendAction('setSave', get(this, '_boundSave'));
  },

  make(role) {
    return get(this, 'globalStore').createRecord({
      type: 'globalRoleBinding',
      globalRoleId: get(role, 'id'),
      subjectName: get(this, 'user.id'),
      subjectKind: 'User',
    });
  },

  save() {
    let add = [];
    let remove = [];

    const user = get(this, 'user');
    const custom = get(this, 'custom');
    const baseRole = get(this,'allRoles').findBy('isBase', true);
    const userRole = get(this, 'allRoles').findBy('id', 'user');
    const adminRole = get(this,'allRoles').findBy('isAdmin', true);
    const mode = get(this, 'mode');

    switch ( mode ) {
    case ADMIN:
      if ( !get(user,'hasAdmin') ) {
        add = [ this.make(adminRole) ];
      }
      break;

      // Admin intentionally doesn't remove any roles

    case USER:
      remove = custom.filterBy('existing').filter((x) => {
        return get(x,'role.isAdmin') || get(x, 'role.isCustom');
      }).map((x) => x.existing);

      // User removes all the admin or custom roles
      add.push(this.make(userRole))
      break;

    case CUSTOM:
      add    = custom.filterBy('active',true ).filterBy('existing',null).map(x => this.make(x.role));
      remove = custom.filterBy('active',false).filterBy('existing').map(y => y.existing);

      add.push(this.make(baseRole));
      break;
    }


    if ( mode !== 'admin') {
      if ( get(user,'hasAdmin') ) {
        const adminBinding = get(user,'globalRoleBindings').filterBy('globalRole.isAdmin');
        if ( adminBinding ) {
          remove.pushObjects(adminBinding);
        }
      }
    }

    return PromiseAll(add.map(x => x.save())).then(() => {
      return PromiseAll(remove.map(x => x.delete())).then(() => {
        return true;
      });
    });
  },
});
