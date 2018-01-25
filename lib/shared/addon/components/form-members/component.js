import Component from '@ember/component';
import layout from './template';
import { computed, get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';
import $ from 'jquery';

const ROLE_BASE = ['cluster-owner', 'cluster-member', 'project-owner', 'project-member'];

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
          let nodes = get(grouped, g);
          let idsOut = [];
          if (nodes.length >1) {
            nodes.forEach((m) => {
              idsOut.push(get(m, 'roleTemplateId'))
            });
            let config = $().extend(true, {}, get(this, 'memberConfig'));
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
            let node = get(nodes, 'firstObject');
            let tpId = get(node, 'roleTemplateId');


            if (ROLE_BASE.includes(tpId)) {
              existing.push({
                role: node,
                toUpdate: true,
                toAdd: false,
                toDelete: false,
                id: Math.random()
              });
            } else {
              idsOut.push(get(node, 'roleTemplateId'));
              existing.push({
                role: node,
                toUpdate: true,
                toAdd: false,
                toDelete: false,
                id: Math.random(),
                customRolesExisting: idsOut,
              });
            }

          }
        });
      }
    }
    set(this, 'memberArray', existing);
  },

  createRole(existing=null) {

    let config = $().extend(true, {}, get(this, 'memberConfig'));
    let type = get(this, 'primaryResource.type');

    set(config, 'subjectKind', 'User');

    if (existing) {
      setProperties(config, {
        subjectName: get(existing, 'subjectName'),
        roleTemplateId: get(existing, 'roleTemplateId'),
      });
    }
    set(config, `${type}Id`, get(this, `primaryResource.id`));

    return get(this,'globalStore').createRecord(config);

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
    const remove = get(this, 'memberArray').filter(r => get(r, 'toDelete') || get(r, 'deleteBasicRole')).map(r => r.role);

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
        let role = this.createRole(get(m, 'role'));
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
    });  },

  actions: {
    setCustomToAdd(member, customIds, customIdsRemove) {
      set(member, 'customRolesToAdd', customIds);
      set(member, 'customRolesToRemove', customIdsRemove);
    },

    cancel() {
      this.goBack();
    },

    addMember(/* kind */) {
      let record = this.createRole();
      let out = {
        role: record,
        toAdd: true,
        toUpdate: false,
        toDelete: false,
        id: Math.random()
      };
      get(this,'memberArray').pushObject(out);
    },

    removeMember(obj) {
      if (obj.customRolesExisting) {
        this.send('setCustomToAdd', obj, null, obj.customRolesExisting);
        set(obj, 'pendingDelete', true);
      } else {
        set(obj, 'toDelete', true);
        set(obj, 'toUpdate', false);
      }
    },
  },

  filteredRoles: computed('roles.[]', function() {
    let pt = get(this, 'type');
    return get(this, 'roles').filterBy('hidden', false).filterBy('context', pt).sortBy('displayName');
  }),

  filteredUsers: computed('users.@each.{id,state}', function() {
    return get(this, 'users').sortBy('displayName');
  }),

});
