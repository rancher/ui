import Ember from 'ember';

export default Ember.Controller.extend({
  bootstrap: function() {
    Ember.run.schedule('afterRender', this, () => {
      Ember.$('#loading-overlay').hide();
      Ember.$('#loading-underlay').hide();
    });
  }.on('init')
});
