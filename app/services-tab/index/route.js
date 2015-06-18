import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    var main = this.modelFor('services-tab');
    if ( main.get('services.length') )
    {
      this.transitionTo('environments');
    }
    else
    {
      this.transitionTo('splash');
    }
  }
});
