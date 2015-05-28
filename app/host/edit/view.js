import Ember from 'ember';
import Overlay from 'ui/overlay/view';

export function addAction(action, selector) {
  return function() {
    this.get('controller').send(action);
    Ember.run.next(this, function() {
      this.$(selector).last().focus();
    });
  };
}

export default Overlay.extend({
  actions: {
    overlayClose: function() {
      this.get('controller').send('cancel');
    },

    overlayEnter: function() {
      this.get('controller').send('save');
    },

    addLabel:       addAction('addLabel',      '.label-key'),
  }
});
