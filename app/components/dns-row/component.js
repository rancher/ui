import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  session:  Ember.inject.service(),

  model: null,
  tagName: '',
  expanded: null,

  canExpand: function() {
    return !!this.get('model.isSelector');
  }.property('model.isSelector'),

  actions: {
    toggle() {
      this.sendAction('toggle');
    },
  },
});
