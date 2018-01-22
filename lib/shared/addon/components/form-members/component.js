import Component from '@ember/component';
import layout from './template';
import { computed, observer, get, set, setProperties } from '@ember/object';
import { on } from '@ember/object/evented';
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

  init() {
    this._super(...arguments);
    this.buildUpdateList(get(this,'primaryResource'))
    this.sendAction('initAlert', this.primaryResourceSaved.bind(this));
  },

  buildUpdateList(resource) {
    let bindingType = `${get(resource, 'type')}RoleTemplateBindings`;
    let existing = get(resource, bindingType).filter(( m ) => {
      return get(m, 'roleTemplateId').indexOf('-owner') < 0 && !(get(this, 'memberArray')||[]).filterBy('toAdd', true).includes(m);
    }).map((role) => {
      return {
        role: role,
        toUpdate: true,
        toAdd: false,
        toDelete: false,
        id: Math.random()
      }
    });
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
