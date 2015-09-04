import Ember from 'ember';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  beforeModel() {
    this._super.apply(this,arguments);
    if ( !this.get('access.enabled') )
    {
      this.transitionTo('authenticated');
    }
  },
});
