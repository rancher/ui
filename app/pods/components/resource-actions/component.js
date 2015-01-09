import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  isDetail: false,

  classNames: ['resource-actions'],

  activeActions: function() {
    var detailed = this.get('isDetail');
    return (this.get('model.availableActions')||[]).filter(function(act) {
      return Ember.get(act,'enabled') && (detailed || !Ember.get(act,'detail'));
    });
  }.property('model.availableActions.[]','model.availableActions.@each.enabled','isDetail'),

  actions: {
    clicked: function(actionName) {
      this.get('model').send(actionName);
    }
  }
});
