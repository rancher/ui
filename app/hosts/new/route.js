import Ember from 'ember';
import C from 'ui/utils/constants';
import { denormalizeName } from 'ui/services/settings';

export default Ember.Route.extend({
  access: Ember.inject.service(),

  model: function() {
    var store = this.get('store');
    if ( this.get('access.admin') && store.hasRecordFor('schema','setting') )
    {
      return store.find('setting', denormalizeName(C.SETTING.API_HOST)).then((setting) => {
        if ( setting.get('value') )
        {
          return Ember.RSVP.resolve();
        }
        else
        {
          this.transitionTo('admin-tab.settings', {queryParams: {backToAdd: true}});
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
