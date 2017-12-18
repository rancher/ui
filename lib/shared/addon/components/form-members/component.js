import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  globalStore: service(),
  memberArray: null,
  project: null,
  editing: false,
  type: null,
  roles: null,
  model: null,
  memberConfig: null,
  actions: {
    cancel() {
      this.goBack();
    },
    addMember(kind) {
      let config = get(this, 'memberConfig');
      set(config, 'subjectKind', kind);
      get(this,'memberArray').pushObject(get(this,'globalStore').createRecord(config));
    },
    removeMember(obj) {
      get(this,'memberArray').removeObject(obj);
    },
  },

  didReceiveAttrs() {
    if (!get(this,'editing')) {
      this.send('addMember', 'User');
    }
  },
});
