import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),
  classNames: ['accordion'],
  expanded: false,

  actions: {
    toggle() {
      this.toggleProperty('expanded');
    },
  },
});
