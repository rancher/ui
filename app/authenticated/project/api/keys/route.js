import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {
    var me = this.get(`session.${C.SESSION.ACCOUNT_ID}`);
    return Ember.RSVP.hash({
      account: this.get('userStore').findAll('apikey', null, {filter: {accountId: me}, url: 'apikeys', forceReload: true}),
      environment: this.get('store').findAll('apikey', null, {forceReload: true}),
    });
  },
});
