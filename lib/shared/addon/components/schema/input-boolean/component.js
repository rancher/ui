import Component from '@ember/component';
import { next } from '@ember/runloop';
import layout from './template';

export default Component.extend({
  layout,

  didReceiveAttrs() {
    next(() => {
      if ( this.get('value') === 'true' ) {
        this.set('value', true);
      } else if ( this.get('value') === 'false' ) {
        this.set('value', false);
      }
    });
  }
});
