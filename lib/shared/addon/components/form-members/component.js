import Component from '@ember/component';
import layout from './template';
import { computed, get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';
import $ from 'jquery';
import { reject } from 'rsvp';

export default Component.extend({
  globalStore:     service(),
  access:          service(),
  intl:            service(),

  layout,
  editing:         false,
  errors:          null,
  memberArray:     null,
  memberConfig:    null,
  model:           null,
  primaryResource: null,
  roles:           null,
  type:            null,
  users:           null,
  creator:         null,
  showCreator:     true,
  toAddCustom:     null,
  _bindings:       null,

  init() {
    this._super(...arguments);

    this.buildUpdateList(get(this, 'primaryResource'))

    if (this.registerHook) {
      this.registerHook(this.saveMembers.bind(this), 'saveMembers');
    }
  },

  actions: {
    cancel() {
      this.goBack();
    },

    addMember(/* kind */) {
      let out = {
        principalId: null,
        bindings:    [],
      }

      get(this, 'memberArray').pushObject(out);
    },

    removeMember(obj) {
      setProperties(obj, {
        pendingDelete: true,
        bindings:      [],
      });
    },
  },

  defaultRoles: computed('roles.[]', function() {
    return get(this, 'roles').filterBy(`${ get(this, 'type') }CreatorDefault`);
  }),

  filteredRoles: computed('roles.[]', function() {
    let pt = get(this, 'type');

    return get(this, 'roles').filterBy('hidden', false).filter((r) => get(r, 'context') === pt || get(r, 'context') === '' || !get(r, 'context') ).sortBy('displayName');
  }),

  filteredUsers: computed('users.@each.{id,state}', function() {
    return get(this, 'users').sortBy('displayName');
  }),

  buildUpdateList(resource) {
    let bindings = set(this, 'currentBindings', get(resource, 'roleTemplateBindings'));

    if (get(bindings, 'length') >= 1) {
      // editing
      let mOut = [];

      set(this, 'memberArray', bindings.filter((b) => !get(b, 'serviceAccount')).forEach((b) => {
        let  match = mOut.findBy('principalId', get(b, 'principalIdReference')) ;

        if (match) {
          match.bindings.push(get(b, 'roleTemplateId'));
          match.preEditBindings.push({
            roleTemplateId: get(b, 'roleTemplateId'),
            id:             get(b, 'id')
          });
        } else {
          match = {
            principalId:     get(b, 'principalIdReference'),
            bindings:        [get(b, 'roleTemplateId')],
            preEditBindings: [{
              roleTemplateId: get(b, 'roleTemplateId'),
              id:             get(b, 'id')
            }],
            isCustom:        get(b, 'isCustom'),
          };

          mOut.push(match);
        }
      }));

      set(this, 'memberArray', mOut);
    } else {
      set(this, 'memberArray', []);
    }
  },

  createRole(inConfig = {}) {
    let config = $().extend(true, {}, get(this, 'memberConfig'), inConfig);
    let type = get(this, 'primaryResource.type');

    // set(config, 'subjectKind', 'User');
    set(config, `${ type }Id`, get(this, `primaryResource.id`));

    return get(this, 'globalStore').createRecord(config);
  },

  saveMembers() {
    const memberArray = get(this, 'memberArray');
    const currentBindings = get(this, 'currentBindings');

    const add = [];
    const remove = [];
    const update = [];

    memberArray.forEach((member) => {
      let bindings = get(member, 'bindings');
      let preEditBindings = get(member, 'preEditBindings') || [];

      if (bindings.length > 0) {
        // update
        if (bindings.length === 1 && get(member, 'preEditBindings.length') === 1) {
          let toUpdate = get(preEditBindings, 'firstObject');
          let neuRT = get(bindings, 'firstObject');
          let match = get(this, 'currentBindings').findBy('id', get(toUpdate, 'id'));

          if ( match && get(match, 'roleTemplateId') !== neuRT) {
            set(match, 'roleTemplateId', neuRT);
            update.push(match);
          }
        } else {
          // bindings to add
          bindings.forEach((memberBinding) => {
            if (!preEditBindings.findBy('roleTemplateId', memberBinding)) {
              if (get(member, 'principalId')) {
                let principalId = get(member, 'principalId');
                let type = get(member, 'memberType');

                if (type === 'group') {
                  add.push(this.createRole({
                    groupPrincipalId: principalId,
                    roleTemplateId:   memberBinding,
                    subjectKind:      'Group'
                  }));
                } else {
                  add.push(this.createRole({
                    userPrincipalId: principalId,
                    roleTemplateId:  memberBinding,
                    subjectKind:     'User'
                  }));
                }
              }
            }
          });

          preEditBindings.forEach((peBinding) => {
            if (!bindings.includes(get(peBinding, 'roleTemplateId'))) {
              remove.push(currentBindings.findBy('id', get(peBinding, 'id')));
            }
          });
        }
      } else {
        // remove
        preEditBindings.forEach((peBinding) => {
          remove.push(currentBindings.findBy('id', get(peBinding, 'id')));
        });
      }
    });

    if (get(this, 'isNew') || this.useCustomizedOwner() || this.hasOwner()) {
      return PromiseAll(add.map((x) => x.save())).then(() => {
        return PromiseAll(update.map((x) => x.save())).then(() => {
          return PromiseAll(remove.map((x) => x.delete())).then(() => {
            if ( this.isDestroyed || this.isDestroying ) {
              return;
            }

            set(this, 'memberArray', []);

            return get(this, 'primaryResource');
          });
        });
      });
    } else {
      set(this, 'errors', [get(this, 'intl').t('formMembers.members.errors.ownerReq')]);

      return reject();
    }
  },

  useCustomizedOwner() {
    const roles = get(this, 'roles') || [];
    const context = get(this, 'primaryResource.type');
    const ownerRole = roles.findBy('id', `${ context }-owner`);
    const defaultRoles = roles.filterBy(`${ context }CreatorDefault`, true);

    if ( ownerRole && !get(ownerRole, 'locked') && get(ownerRole, `${ context }CreatorDefault`) && get(defaultRoles, 'length') === 1 ){
      return false;
    } else {
      return true;
    }
  },

  hasOwner() {
    let memberArray = get(this, 'memberArray');
    let matches     = [];
    let okay        = true;

    // find the matching bindings in the memebrsArray.bindings property, these will be the active bindings. when i binding is removed its also dropped out fo this array
    matches = memberArray.filter((member) => {
      return get(member, 'bindings').includes(`${ get(this, 'primaryResource.type') }-owner`);
    });

    if (matches.length <= 0) {
      okay = false;
    }


    return okay;
  },

});
