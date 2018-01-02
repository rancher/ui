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

  actions: {
    cancel() {
      this.goBack();
    },
    addMember(kind) {
      let config = get(this, 'memberConfig');
      set(config, 'subjectKind', kind.toUpperCase()); //should be upper but make sure
      get(this,'memberArray').pushObject(get(this,'globalStore').createRecord(config));
    },
    removeMember(obj) {
      get(this,'memberArray').removeObject(obj);
    },
  },

  filteredUsers: computed('users', function() {
    return get(this, 'users').filter((user) => {
      if (!get(this, 'creator') && get(this, 'creator.userName') !== get(user, 'userName')) {
        return user;
      }
    });
  }),

});
