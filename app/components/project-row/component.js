import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  tagName: 'TR',

  showCluster: false,

  projects: Ember.inject.service(),

  actions: {
    switchTo(id) {
      // @TODO bad
      window.lc('authenticated').send('switchProject', id);
    }
  },
});
