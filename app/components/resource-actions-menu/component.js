import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  choices: null,
  parentController: null,

  classNames: ['resource-actions'],
  classNameBindings: ['activeActions.length::hide'],

  open: false,
  didInsertElement: function() {
    this.$().on('show.bs.dropdown', () => {
      this.set('open', true);
    });

    this.$().on('hidden.bs.dropdown', () => {
      this.set('open', false);
    });
  },

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
    clicked: function(actionName) {
      this.get('model').send(actionName, this.get('parentController'));
    }
  },
});
