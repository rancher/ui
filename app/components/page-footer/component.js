import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'footer',
  className: 'clearfix',

  settings: Ember.inject.service(),
  
  actions: {
    showAbout() {
      this.sendAction('showAbout');
    },

  }
});


