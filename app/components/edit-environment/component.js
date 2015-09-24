import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  editing: true,
  originalModel: null,
  model: null,

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },

  willInsertElement: function() {
    var orig = this.get('originalModel');
    var clone = orig.clone();
    delete clone.services;
    this.set('model', clone);
  },

  doneSaving: function() {
    this.sendAction('dismiss');
  }
});
