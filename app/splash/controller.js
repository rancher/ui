import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  settings: Ember.inject.service(),
  docsBase: C.EXT_REFERENCES.DOCS,

  thingsChanged: function() {
    console.log(this.get('application.currentRouteName'),this.get('model.hosts.length'),this.get('model.services.length'));
    if ( this.get('application.currentRouteName') === 'splash')
    {
      if ( this.get('model.hosts.length') && this.get('model.services.length') )
      {
        this.replaceRoute('environments');
      }
    }
  }.observes('model.hosts.length','model.services.length'),

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
