import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  editing: true,
  originalModel: null,
  model: null,

  willInsertElement() {
    this.set('model', this.get('originalModel').clone());
  },

  actions: {
    outsideClick() {
    },

    cancel() {
      this.sendAction('dismiss');
    },
  },

  doneSaving() {
    this.sendAction('dismiss');
  },
});
