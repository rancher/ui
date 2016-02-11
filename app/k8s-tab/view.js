import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement() {
    this._super();
    $('BODY').addClass('k8s');
  },

  willDestroyElement() {
    this._super();
    $('BODY').removeClass('k8s');
  },
});
