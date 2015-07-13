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

  canSave: function() {
    return (this.get('originalModel.name')||'') !== (this.get('model.name')||'') ||
           (this.get('originalModel.description')||'') !== (this.get('model.description')||'');
  }.property('originalModel.{name,description}','model.{name,description}'),

  doneSaving: function() {
    this.sendAction('dismiss');
  },

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },

});
