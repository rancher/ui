import Ember from 'ember';

export default Ember.Component.extend({
  projects     : Ember.inject.service(),
  hasVm        : Ember.computed.alias('projects.current.virtualMachine'),

  index        : null,
  choices      : null,
  showAdd      : true,
  initialIndex : -1,

  actions: {
    switch(index) {
      this.sendAction('switch', index);
    },

    add(vm) {
      this.sendAction('add', vm);
    },
  },

  init() {
    this._super(...arguments);
    this.send('switch', this.get('initialIndex'));
  },

  hasSidekicks: function() {
    return this.get('choices.length') > 1;
  }.property('choices.length'),

  enabledChoices: function() {
    return this.get('choices').filterBy('enabled',true);
  }.property('choices.@each.enabled')
});
