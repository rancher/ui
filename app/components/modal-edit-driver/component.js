import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  settings: Ember.inject.service(),

  clone           : null,
  originalModel   : null,
  primaryResource : Ember.computed.alias('originalModel'),
  errors          : null,

  didReceiveAttrs() {
    this.set('clone', this.get('originalModel').clone());
    this.set('model', this.get('originalModel').clone());
  },

  editing: function() {
    return !!this.get('clone.id');
  }.property('clone.id'),

  actions: {
    cancel: function() {
      this.sendAction('dismiss');
    },
  },

  didRender() {
    setTimeout(() => {
      this.$('INPUT')[0].focus();
    }, 500);
  },

  doneSaving() {
    this.sendAction('dismiss');
  }
});
