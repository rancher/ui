import NewOrEdit from 'ui/mixins/new-or-edit';
import Ember from 'ember';

export default Ember.Component.extend(NewOrEdit, {
  existing: Ember.computed.alias('originalModel'),
  editing: true,

  service: null,
  primaryResource: Ember.computed.alias('service'),

  actions: {
    done() {
      this.sendAction('dismiss');
    },

    cancel() {
      this.sendAction('dismiss');
    },
  },

  init() {
    this._super(...arguments);
    var original = this.get('originalModel');
    this.set('service', original.clone());
  },

  doneSaving: function() {
    this.send('done');
  },

  didInsertElement() {
    this.$('INPUT')[0].focus();
  },
});
