import Ember from 'ember';

export default Ember.Mixin.create({
  application : Ember.inject.controller(),
  queryParams : ['instanceId'],
  instanceId  : null,
  model       : null,

  bootstrap: function() {
    if (this.get('application.isPopup')) {
      Ember.$('body').css('overflow', 'hidden');
    }
  }.on('init'),

  actions: {
    cancel: function() {
      window.close();
    }
  }
});
