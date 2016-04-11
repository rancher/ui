import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {
    var store = this.get('store');
    var me = this.get(`session.${C.SESSION.ACCOUNT_ID}`);
    return Ember.RSVP.hash({
      account: store.find('apikey', null, {filter: {accountId: me}, url: 'apikeys', authAsUser: true, forceReload: true}),
      environment: store.find('apikey', null, {forceReload: true}),
    }).then(() => {
      return store.allUnremoved('apikey');
    });
  },
});
