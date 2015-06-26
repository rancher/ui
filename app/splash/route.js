import Ember from 'ember';

export default Ember.Route.extend({
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
