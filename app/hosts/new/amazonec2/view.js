import Ember from 'ember';
import DriverView from 'ui/hosts/new/driver-view';

export default DriverView.extend({
  stepDidChange: function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      document.body.scrollTop = document.body.scrollHeight;
    });
  }.observes('context.step'),
});
