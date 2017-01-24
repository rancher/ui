import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  model: null,

  actions: {
    cancel() {
      this.sendAction('cancel');
    }
  },

  doneSaving() {
    this.sendAction('cancel');
  },
});
