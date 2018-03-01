import Component from '@ember/component';
import layout from './template';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';
import $ from 'jquery';

export default Component.extend({
  layout,
  globalStore:     service(),
  access:          service(),

  //new


  //todo verify all of these are used
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
    this.sendAction('registerHook', this.saveMembers.bind(this), 'saveMembers');
  },

  buildUpdateList(resource) {
    let bindings = set(this, 'currentBindings', get(resource, 'roleTemplateBindings').filter(b => b.name !== 'creator'));

    if (get(bindings, 'length') >= 1) {
      //editing
      let mOut = [];

      set(this, 'memberArray', bindings.forEach((b) => {

        let  match = mOut.findBy('memberId', get(b, 'userId')) ;

        if (match) {

          match.bindings.push(get(b, 'roleTemplateId'));
          match.preEditBindings.push({roleTemplateId: get(b, 'roleTemplateId'), id: get(b, 'id')});

        } else {

          debugger
          match = {
            memberId: get(b, 'userId'),
            bindings: [get(b, 'roleTemplateId')],
            preEditBindings: [{roleTemplateId: get(b, 'roleTemplateId'), id: get(b, 'id')}],
            isCustom: get(b, 'isCustom'),
          };

          mOut.push(match);

        }

      }));

      set(this, 'memberArray', mOut);

    } else {

      set(this, 'memberArray', []);
    }

  },

  createRole(inConfig={}) {

    let config = $().extend(true, get(this, 'memberConfig'), inConfig);
    let type = get(this, 'primaryResource.type');

    set(config, 'subjectKind', 'User');
    set(config, `${type}Id`, get(this, `primaryResource.id`));

    return get(this,'globalStore').createRecord(config);

  },

  saveMembers: function() {
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

          //bindings to add
          bindings.forEach((memberBinding) => {
            if (!preEditBindings.findBy('roleTemplateId', memberBinding)) {
              if (get(member, 'memberId')) {
                let memberId = get(member, 'memberId');
                if (memberId.includes('github')) {
                  add.push(this.createRole({userPrincipalId: get(member, 'memberId'), roleTemplateId: memberBinding}));
                } else {
                  add.push(this.createRole({userId: get(member, 'memberId'), roleTemplateId: memberBinding}));
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
        //remove
        preEditBindings.forEach((peBinding) => {
          remove.push(currentBindings.findBy('id', get(peBinding, 'id')));
        });
      }

    });
    // console.log(add, update, remove);

    return PromiseAll(add.map(x => x.save())).then(() => {
      return PromiseAll(update.map(x => x.save())).then(() => {
        return PromiseAll(remove.map(x => x.delete())).then(() => {
          if ( this.isDestroyed || this.isDestroying ) {
            return;
          }

          set(this, 'memberArray', []);
          return get(this, 'primaryResource');
        });
      });
    });
  },

  actions: {
    cancel() {
      this.goBack();
    },

    addMember(/* kind */) {
      let out = {
        memberId: null,
        bindings: [],
      }
      get(this,'memberArray').pushObject(out);
    },

    removeMember(obj) {
      set(obj, 'pendingDelete', true);
      set(obj, 'bindings', []);
    },
  },

  filteredRoles: computed('roles.[]', function() {
    let pt = get(this, 'type');
    return get(this, 'roles').filterBy('hidden', false).filter(r => get(r, 'context') === pt || get(r, 'context') === '' || !get(r, 'context') ).sortBy('displayName');
  }),

  filteredUsers: computed('users.@each.{id,state}', function() {
    return get(this, 'users').sortBy('displayName');
  }),

});
