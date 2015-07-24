import Ember from 'ember';
import EditProject from 'ui/mixins/edit-project';

export default Ember.Component.extend(EditProject, {
  access: Ember.inject.service(),
  accessEnabled: Ember.computed.alias('access.enabled'),

  model: null,
  editing: null,

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },

  willInsertElement: function() {
    this._super();
    this.set('model', this.get('originalModel').clone());
    this.set('editing', !!this.get('originalModel.id'));
  },

  willSave: function() {
    var out = this._super();
    if ( out && !this.get('model.id') )
    {
      this.set('model.members', this.get('model.projectMembers'));
    }
    return out;
  },

  didSave: function() {
    if ( this.get('editing') && this.get('access.enabled') )
    {
      return this.get('model').doAction('setmembers',{members: this.get('model.projectMembers')});
    }
  },

  doneSaving: function() {
    this._super();
    this.sendAction('dismiss');
  },
});
