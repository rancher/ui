import Ember from 'ember';

export default Ember.Controller.extend({
  thingsChanged: function() {
    if ( this.get('model.hosts.length') && this.get('model.services.length') )
    {
      this.replaceRoute('environments');
    }
  }.observes('model.hosts.length','model.services.length'),
});
