import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  choices: null,
  isDetail: false,
  big: false,
  colors: true,

  classNames: ['resource-actions'],

  activeActions: function() {
    var detailed = this.get('isDetail');
    return (this.get('choices')||[]).filter(function(act) {
      return Ember.get(act,'enabled') && (detailed || !Ember.get(act,'detail'));
    });
  }.property('choices.[]','choices.@each.enabled','isDetail'),

  actions: {
    clicked: function(actionName) {
      this.get('model').send(actionName);
    }
  }
});
