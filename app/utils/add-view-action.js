import Ember from 'ember';

export function addAction(action, selector) {
  return function() {
    if ( Ember.Component.detectInstance(this) )
    {
      this._super();
    }
    else
    {
      this.get('controller').send(action);
    }

    Ember.run.next(this, function() {
      this.$(selector).last().focus();
    });
  };
}
