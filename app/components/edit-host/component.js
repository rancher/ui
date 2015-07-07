import Ember from 'ember';
import EditLabels from 'ui/mixins/edit-labels';
import NewOrEdit from 'ui/mixins/new-or-edit';


export default Ember.Component.extend(NewOrEdit, EditLabels, {
  editing: true,
  originalModel: null,
  model: null,

  willInsertElement: function() {
    this.set('model', this.get('originalModel').clone());
    this.initLabels();
  },

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },

  doneSaving: function() {
    this.sendAction('dismiss');
  },
});
