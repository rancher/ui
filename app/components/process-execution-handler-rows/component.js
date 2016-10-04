import Ember from 'ember';

export default Ember.Component.extend({
  tagName              : '',
  expanded             : false,
  depth                : 0,
  expandAll : false,
  modalService: Ember.inject.service('modal'),

  actions: {
    expand: function() {
      this.toggleProperty('expanded');
    },
    showError: function(model) {
      this.get('modalService').toggleModal('modal-process-error', model);
    }
  },

  init() {
    this._super(...arguments);
    if (this.get('nodeDepth')) {
      this.set('depth', this.incrementProperty('nodeDepth'));
    } else {
      this.set('depth', 1);
    }
  },

  checkExecutions: function() {
    if (this.get('execution').children.length > 0) {
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
