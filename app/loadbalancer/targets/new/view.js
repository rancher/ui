import Ember from 'ember';
import Overlay from 'ui/overlay/view';

function addAction(action, selector) {
  return function() {
    this.get('controller').send(action);
    Ember.run.next(this, function() {
      this.$(selector).last().focus();
    });
  };
}

export default Overlay.extend({
  actions: {
    addTargetContainer: addAction('addTargetContainer', '.lb-target'),
    addTargetIp: addAction('addTargetIp', '.lb-target'),
  }
});
