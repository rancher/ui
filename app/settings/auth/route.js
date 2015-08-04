import Ember from 'ember';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  model: function() {
    if ( this.get('access.enabled') )
    {
      this.replaceWith('settings.auth.' + this.get('access.provider').replace(/config$/i,''));
    }
    else
    {
      this.replaceWith('settings.auth.github');
    }
  },
});
