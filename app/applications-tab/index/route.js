import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    var hasK8s = window.lc('authenticated').get('hasKubernetes');
    if ( hasK8s )
    {
      this.transitionTo('environments', {queryParams: {which: 'kubernetes'}});
    }
    else
    {
      this.transitionTo('environments');
    }
  }
});
