import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  choices: null,
  addAction: null,

  classNames: ['resource-actions'],

  activeActions: function() {
    var list =  (this.get('choices')||[]).filter(function(act) {
      return Ember.get(act,'enabled') || Ember.get(act,'divider');
    });

    // Remove dividers at the beginning
    while ( list.get('firstObject.divider') === true )
    {
      list.shiftObject();
    }

    // Remove dividers at the end
    while ( list.get('lastObject.divider') === true )
    {
      list.popObject();
    }

    // Remove consecutive dividers
    var last = null;
    list = list.filter(function(act) {
      var cur = (act.divider === true);
      var ok = !cur || (cur && !last);
      last = cur;
      return ok;
    });

    return list;
  }.property('choices.[]','choices.@each.enabled'),

  actions: {
    add: function() {
      this.get('model').send(this.get('addAction'));
    },

    clicked: function(actionName) {
      this.get('model').send(actionName);
    }
  }
});
