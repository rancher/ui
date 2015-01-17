import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    this._super.apply(this,arguments);
    if ( !this.get('app.authenticationEnabled') )
    {
      this.transitionTo('index');
    }
  }
});
