import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    var main = this.modelFor('applications-tab');
    if ( main.get('hosts.length') && main.get('services.length') )
    {
      this.replaceWith('environments');
    }
  },

  model: function() {
    var main = this.modelFor('applications-tab');
    if ( main.get('environments.length') === 0 )
    {
      var env = this.get('store').createRecord({
        type: 'environment',
        name: 'Default',
      });

      return env.save().then(() => {
        main.set('environmentId', env.get('id'));
        return main;
      });
    }
    else
    {
      main.set('environmentId', main.get('environments.firstObject.id'));
      return main;
    }
  }
});
