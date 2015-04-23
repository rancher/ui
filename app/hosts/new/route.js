import C from 'ui/utils/constants';
import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    var userType = this.get('session').get(C.SESSION.USER_TYPE);
    var isAdmin = userType === undefined || userType === C.USER.TYPE_ADMIN;
    if ( isAdmin && store.hasRecordFor('schema','setting') )
    {
      return store.find('setting', C.SETTING.API_HOST).then((setting) => {
        if ( setting.get('value') )
        {
          return Ember.RSVP.resolve();
        }
        else
        {
          this.transitionTo('hosts.setup');
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

  activate: function() {
    this.send('setPageLayout', {label: 'All Hosts', backRoute: 'hosts'});
  },
});
