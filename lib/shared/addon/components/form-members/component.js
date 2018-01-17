import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';

export default Component.extend({
  layout,
  globalStore: service(),
  access: service(),

  editing:      false,
  memberArray:  null,
  memberConfig: null,
  model:        null,
  project:      null,
  roles:        null,
  type:         null,
  users:        null,
  creator:      null,

  toAdd: null,
  toUpdate: null,
  toRemove: null,

  init() {
    this._super(...arguments);
    set(this, 'toAdd', []);
    set(this, 'toUpdate', []);
    set(this, 'toRemove', []);
    this.sendAction('initAlert', this.primaryResourceSaved.bind(this));
  },

  primaryResourceSaved: function() {
    // returns a promise of all the adds/removes/updates to the parent
    const pr = get(this, 'project');
    const projectId = get(pr, 'id');
    const add = (get(this, 'toAdd')||[]);
    const update = get(this, 'toUpdate')||[];
    const remove = get(this, 'toRemove')||[];

    add.forEach((x) => {
      x.set(`${get(this, 'type')}Id`, projectId);
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
    cancel() {
      this.goBack();
    },

    addMember(kind) {
      let config = get(this, 'memberConfig');
      set(config, 'subjectKind', kind.capitalize()); //should be upper but make sure
      // not setting the name correctly
      let record = get(this,'globalStore').createRecord(config);
      get(this,'memberArray').pushObject(record);
      get(this, 'toAdd').pushObject(record);
    },

    updateMember(obj) {
      get(this,'toUpdate').addObject(obj);
    },


    removeMember(obj) {
      get(this,'memberArray').removeObject(obj);
      get(this, 'toRemove').pushObject(obj);
    },
  },

  filteredUsers: computed('users', function() {
    return get(this, 'users');
    //.filter((user) => {
    //return get(this, 'creator.username') !== get(user, 'username');
    //});
  }),

});
