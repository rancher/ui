import Ember from 'ember';
import BootstrapFixes from 'ui/utils/bootstrap-fixes';

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

    this.$().on('shown.bs.dropdown', (event, data) => {
      Ember.run.next(() => {
        BootstrapFixes.resizeDropdown(event, data);
      });
    });

    this.$().on('hidden.bs.dropdown', () => {
      this.set('open', false);
    });
  },

  activeActions: function() {
    var list =  (this.get('choices')||this.get('model.availableActions')||[]).filter(function(act) {
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
