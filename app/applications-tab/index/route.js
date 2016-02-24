import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  redirect: function() {
    if ( window.lc('authenticated').get('hasKubernetes') )
    {
      this.transitionTo('environments', {queryParams: {which: C.EXTERNALID.KIND_NOT_KUBERNETES}});
    }
    else
    {
      this.transitionTo('environments');
    }
  }
});
