import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),
  hasVm: Ember.computed.alias('settings.hasVm'),

  index: null,
  choices: null,
  showAdd: true,
  addLabel: 'Sidekick Container',
  initialIndex: -1,

  actions: {
    switch(index) {
      this.sendAction('switch', index);
    },

    add(vm) {
      this.sendAction('add', vm);
    },
  },

  didInitAttrs() {
    this.send('switch', this.get('initialIndex'));
  },

  hasSidekicks: function() {
    return this.get('choices.length') > 1;
  }.property('choices.length'),

  enabledChoices: function() {
    return this.get('choices').filterBy('enabled',true);
  }.property('choices.@each.enabled')
});
