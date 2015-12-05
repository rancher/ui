import Ember from 'ember';

export default Ember.Component.extend({
  launchConfig: null,

  classNames: ['r-pt10'],

  didInitAttrs() {
    if ( !this.get('launchConfig.memoryMb') )
    {
      this.set('launchConfig.memoryMb', 512);
    }
  },
});
