import Component from '@ember/component';
import layout from './template';
import { computed, get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';

export default Component.extend({
  layout,
  globalStore:     service(),
  access:          service(),

  editing:         false,
  memberArray:     null,
  memberConfig:    null,
  model:           null,
  primaryResource: null,
  roles:           null,
  type:            null,
  users:           null,
  creator:         null,
  showCreator:     true,
  toAddCustom: null,
  _bindings: null,

  init() {
    this._super(...arguments);
    this.buildUpdateList(get(this,'primaryResource'))
    this.sendAction('initAlert', this.primaryResourceSaved.bind(this));
  },

  buildUpdateList(resource) {
    let bindingType = `${get(resource, 'type')}RoleTemplateBindings`;
    let bindings = get(resource, bindingType).filter(b => b.name !== 'creator');
    let existing = [];
    let grouped = {};
    set(this, "_bindings", bindings.slice());
    if (bindings && get(this, 'editing')) {
      bindings.forEach((b) => {
        if (grouped[get(b, 'subjectName')]) {
          grouped[get(b, 'subjectName')].push(b);
        } else {
          grouped[get(b, 'subjectName')] = [b];
        }
      });

      if (grouped) {
        Object.keys(grouped).forEach((g) => {
          if (grouped[g].length >1) {
            let idsOut = [];
            grouped[g].forEach((m) => {
              idsOut.push(get(m, 'roleTemplateId'))
            });
            let config = get(this, 'memberConfig');
            set(config, 'subjectKind', 'User'); //should be upper but make sure
            set(config, 'subjectName', g);
            let record = get(this,'globalStore').createRecord(config);

            let out = {
              role: record,
              toUpdate: false,
              toAdd: false,
              toDelete: false,
              customRolesExisting: idsOut
            }

            existing.push(out);
          } else {
            existing.push({
              role: grouped[g][0],
              toUpdate: true,
              toAdd: false,
              toDelete: false,
              id: Math.random()
            })
          }
        });
      }
    }
    set(this, 'memberArray', existing);
  },

  primaryResourceSaved: function() {
    // returns a promise of all the adds/removes/updates to the parent
    const pr = get(this, 'primaryResource');
    const resourceId = get(pr, 'id');
    const memberArray = get(this, 'memberArray').slice();

    const customToAdd = memberArray.filterBy('customRolesToAdd');
    const customToRemove = memberArray.filterBy('customRolesToRemove');

    const add = get(this, 'memberArray').filter(r => get(r, 'toAdd') && !get(r, 'customRolesToAdd')).map(a => a.role);
    const update = get(this, 'memberArray').filterBy('toUpdate', true).map(u => u.role);
    const remove = get(this, 'memberArray').filterBy('toRemove', true).map(r => r.role);

    customToRemove.forEach((rm) => {
      // custom obj from custom
      get(rm, 'customRolesToRemove').forEach((roleTempId) => {
        let match = get(this, '_bindings').find((binding) => {
          if (get(binding, 'roleTemplateId') === roleTempId) {
            return binding;
          }
        });
        remove.push(match);
      });
    });
    customToAdd.forEach((m) => {
      get(m, 'customRolesToAdd').forEach((a) => {
        let role = get(m, 'role').clone();
        set(role, 'roleTemplateId', a);
        add.addObject(role);
      })
    });

    add.forEach((x) => {
      x.set(`${get(this, 'type')}Id`, resourceId);
      x.set('name', null);
    });

    return PromiseAll(add.map(x => x.save())).then(() => {
      return PromiseAll(update.map(x => x.save())).then(() => {
        return PromiseAll(remove.map(x => x.delete())).then(() => {
          set(this, 'memberArray', []);
          return pr;
        });
      });
    });
  },

  actions: {
    setCustomToAdd(member, customIds, customIdsRemove) {
      set(member, 'customRolesToAdd', customIds);
      set(member, 'customRolesToRemove', customIdsRemove);
    },

    cancel() {
      this.goBack();
    },

    addMember(kind) {
      let config = get(this, 'memberConfig');
      set(config, 'subjectKind', kind.capitalize()); //should be upper but make sure
      // not setting the name correctly
      let record = get(this,'globalStore').createRecord(config);
      let out = {
        role: record,
        toAdd: true,
        toUpate: false,
        toRemove: false,
        id: Math.random()
      };
      get(this,'memberArray').pushObject(out);
    },

    removeMember(obj) {
      let exists = get(this, 'memberArray').findBy('id', get(obj, 'id'));
      if (get(obj, 'toAdd') && exists) {
        // we just added and should remove it because the record has not been persisted yet
        get(this,'memberArray').removeObject(obj);
      } else if (exists) {
        setProperties(exists, {
          toAdd: false,
          toUpdate: false,
          toDelete: true,
        });
      }
    },
  },

  filteredUsers: computed('users.@each.{id,state}', function() {
    let users = get(this, 'users');
    if (get(this, 'editing')) {
      users = users.filter(u => !u.hasOwnProperty('me'));
    }
    return users.sortBy('displayName');
  }),

});
