import Ember from 'ember';

export default Ember.Component.extend({
  tagName    : '',
  expanded   : false,
  expandAll  : false,
  expandSelf : false,
  depth      : 0,

  actions: {
    expand: function() {
      this.toggleProperty('expanded');
    },
    showError: function(model) {
      this.get('application').setProperties({
        openProcessesError: true,
        exception: model
      });
    }
  },

  setup: Ember.on('init', function() {

    if (this.get('nodeDepth')) {
      this.set('depth', this.incrementProperty('nodeDepth'));
    } else {
      this.set('depth', 1);
    }
  }),

  checkProcessHandlerExecutions: function() {
    if (this.get('execution').hasOwnProperty('processHandlerExecutions') && this.get('execution').processHandlerExecutions.length > 0) {
      return true;
    } else {
      return false;
    }
  }.property(),

  expandChildren: function() {
    if (this.get('expandAll')) {
      this.set('expanded', true);
    } else {
      this.set('expanded', false);
    }
  }.observes('expandAll').on('init')
});
