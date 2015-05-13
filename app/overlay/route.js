import Ember from 'ember';

export default Ember.Route.extend({
  rememberPrevious: function() {
    // Do nothing, don't remember overlays as a previous.
  }
});
