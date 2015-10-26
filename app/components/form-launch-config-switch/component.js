import Ember from 'ember';

export default Ember.Component.extend({
  index: null,
  choices: null,
  showAdd: true,

  actions: {
    switch(index) {
      this.sendAction('switch', index);
    },

    add() {
      this.sendAction('add');
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
