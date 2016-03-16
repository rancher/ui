import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  expanded: false,

  tagName: '',

  actions: {
    toggleExpand() {
      this.toggleProperty('expanded');
    }
  },
});
