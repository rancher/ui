import Ember from 'ember';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  beforeModel: function() {
    this._super.apply(this,arguments);
    if ( this.get('access.enabled') )
    {
      var provider = this.get('access.provider').toLowerCase();
      this.transitionTo('login.' + provider.replace(/config$/,''));
    }
    else
    {
      this.transitionTo('authenticated');
    }
  },
});
