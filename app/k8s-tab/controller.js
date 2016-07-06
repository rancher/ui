import Ember from 'ember';
export default Ember.Controller.extend({
  bootstrap: function() {
    Ember.run.schedule('afterRender', this, () => {
      $('BODY').addClass('k8s');
    });
  }.on('init'),
});
