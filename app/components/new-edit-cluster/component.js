import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  editing: true,
  primaryResource: Ember.computed.alias('cluster'),

  cluster: null,

  actions: {
    done() {
      this.sendAction('done');
    },

    editStack(obj) {
      obj;
    },

    removeStack(obj) {
      this.get('primaryResource.systemStacks').removeObject(obj);
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  doneSaving: function() {
    this.send('cancel');
  }
});
