import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';

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
    this.sendUpdate();
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
      this.sendUpdate();
    },

    updateMember(obj) {
      get(this,'toUpdate').addObject(obj);
      this.sendUpdate();
    },


    removeMember(obj) {
      get(this,'memberArray').removeObject(obj);
      get(this, 'toRemove').pushObject(obj);
      this.sendUpdate();
    },
  },

  sendUpdate() {
    const add = get(this, 'toAdd').filterBy('subjectName').filterBy('roleTemplateId');
    const update = get(this, 'toUpdate').filter((x) => !add.includes(x));
    const remove = get(this, 'toRemove');
    this.sendAction('updateLists', add, update, remove);
  },

  filteredUsers: computed('users', function() {
    return get(this, 'users');
    //.filter((user) => {
    //return get(this, 'creator.userName') !== get(user, 'userName');
    //});
  }),

});
