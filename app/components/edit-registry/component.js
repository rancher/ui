import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  error: null,
  credentials: null,
  model: null,
  editing: true,
  primaryResource: null,

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    },
  },

  willInsertElement: function() {
    this._super();
    var orig = this.get('originalModel');

    this.set('model',Ember.Object.create({
      allRegistries: orig.get('registries'),
      registry: orig.get('registry').clone(),
      credential: orig.get('credential').clone()
    }));

    this.setProperties({
      'primaryResource': this.get('model.credential'),
      'activeDriver': 'custom',
      'editing': true
    });
  },

  doneSaving: function() {
    this._super();
    this.sendAction('dismiss');
  },
});
