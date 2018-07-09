import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  didReceiveAttrs() {

    if ( this.get('value') === 'false' ) {

      this.set('value', false);

    } else if ( this.get('value') === 'true' ) {

      this.set('value', true);

    }

  }
});
