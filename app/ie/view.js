import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    $('#loading-overlay').hide();
    $('#loading-underlay').hide();
  }
});
