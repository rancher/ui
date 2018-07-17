import { next } from '@ember/runloop';
import Component from '@ember/component';

export function addAction(action, selector) {
  return function() {
    if ( Component.detectInstance(this) ) {
      this._super();
    } else {
      this.get('controller').send(action);
    }

    next(this, function() {
      var matches = this.$(selector);

      if ( matches ) {
        var last = matches.last();

        if ( last ) {
          last.focus();
        }
      }
    });
  };
}

export default { addAction }
