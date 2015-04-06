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
    addHost: addAction('addHost', '.lb-host'),
  }
});
