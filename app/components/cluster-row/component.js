import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  tagName: '',

  expanded: null,

  actions: {
    toggle() {
      this.sendAction('toggle');
    },

    switchToProject(id) {
      // @TODO bad
      window.lc('authenticated').send('switchProject', id);
    }
  },
});
