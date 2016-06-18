import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['form-control-static'],

  didReceiveAttrs() {
    if ( this.get('value') === 'false' ) {
      this.set('value', false);
    }
    else if ( this.get('value') === 'true' ) {
      this.set('value', true);
    }
  }
});
