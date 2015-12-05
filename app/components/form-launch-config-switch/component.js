import Ember from 'ember';

export default Ember.Component.extend({
  index: null,
  choices: null,
  showAdd: true,

  actions: {
    switch(index) {
      this.sendAction('switch', index);
    },

    add(vm) {
      this.sendAction('add', vm);
    },
  },

  didInitAttrs() {
    this.send('switch',-1);
  },

  hasSidekicks: function() {
    return this.get('choices.length') > 1;
  }.property('choices.length'),

  enabledChoices: function() {
    return this.get('choices').filterBy('enabled',true);
  }.property('choices.@each.enabled')
});
