import { next } from '@ember/runloop';
import Component from '@ember/component';
import $ from 'jquery';

export function addAction(action, selector) {
  return function() {
    if ( Component.detectInstance(this) ) {
      this._super();
    } else {
      this.get('controller').send(action);
    }

    next(this, () => {
      var matches = $(selector);

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
