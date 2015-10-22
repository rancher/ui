import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),

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
});
