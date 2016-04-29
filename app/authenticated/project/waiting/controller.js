import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  authenticated: Ember.inject.controller(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  docsBase: C.EXT_REFERENCES.DOCS,

  isReadyChanged: function() {
    //console.log(this.get('application.currentRouteName'),this.get('model.hosts.length'),this.get('model.services.length'));
    if ( this.get('application.currentRouteName') === 'authenticated.project.waiting')
    {
      if ( this.get('authenticated.ready') )
      {
        this.replaceRoute('authenticted.project.index');
      }
    }
  }.observes('authenticated.isReady'),

  actions: {
    newService() {
      var environmentId = this.get('model.environmentId');

      if ( environmentId )
      {
        this.transitionToRoute('service.new', {queryParams: {environmentId: environmentId}});
      }
      else
      {
        var env = this.get('store').createRecord({
          type: 'environment',
          name: 'Default',
        });

        return env.save().then(() => {
          this.transitionToRoute('service.new', {queryParams: {environmentId: env.get('id') }});
        });
      }
    },
  },
});
