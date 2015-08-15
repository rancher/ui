import C from 'ui/utils/constants';
import Ember from 'ember';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  model: function() {
    var store = this.get('store');
    if ( this.get('access.admin') && store.hasRecordFor('schema','setting') )
    {
      return store.find('setting', C.SETTING.API_HOST).then((setting) => {
        if ( setting.get('value') )
        {
          return Ember.RSVP.resolve();
        }
        else
        {
          this.transitionTo('settings.host', {queryParams: {backToAdd: true}});
        }
      });
    }
  },

  actions: {
    cancel: function() {
      // @TODO don't remember switches between tabs as previous routes
      //this.send('goToPrevious');
      this.transitionTo('hosts');
    }
  },
});
