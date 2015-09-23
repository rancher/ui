import Ember from 'ember';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  model: function() {
    if ( this.get('access.enabled') )
    {
      this.replaceWith('admin-tab.auth.' + this.get('access.provider').replace(/config$/i,''));
    }
    else
    {
      this.replaceWith('admin-tab.auth.github');
    }
  },
});
