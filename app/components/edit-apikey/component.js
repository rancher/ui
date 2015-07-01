import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit,{
  originalModel: null,
  model: null,
  justCreated: false,
  cancelAsClose: Ember.computed.alias('justCreated'),

  willInsertElement: function() {
    this.set('model', this.get('originalModel').clone());
  },

  doneSaving: function() {
    this.sendAction('dismiss');
  },

  actions: {
    cancel: function() {
      this.sendAction('dismiss');
    }
  },

});
