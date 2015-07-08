import Ember from 'ember';

export function addAction(action, selector) {
  return function() {
    this._super();
    Ember.run.next(this, function() {
      this.$(selector).last().focus();
    });
  };
}
