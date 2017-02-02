import Ember from 'ember';

export default Ember.Component.extend({
  launchConfig : null,

  classNames   : ['pt-10'],

  init() {
    this._super(...arguments);

    if ( !this.get('launchConfig.memoryMb') )
    {
      this.set('launchConfig.memoryMb', 512);
    }
  },
});
