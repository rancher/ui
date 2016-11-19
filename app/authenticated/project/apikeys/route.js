import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {
    var me = this.get(`session.${C.SESSION.ACCOUNT_ID}`);
    return Ember.RSVP.hash({
      account: this.get('userStore').find('apikey', null, {filter: {accountId: me}, url: 'apikeys', forceReload: true}),
      environment: this.get('store').find('apikey', null, {forceReload: true}),
    }).then(() => {
      var Proxy = Ember.ArrayProxy.extend({
        account: null,
        environment: null,
        content: function() {
          return this.get('account').toArray().concat(this.get('environment').toArray());
        }.property('account.[]','environment.[]'),
      });

      return Proxy.create({
        account: this.get('userStore').all('apikey'),
        environment: this.get('store').all('apikey'),
      });
    });
  },
});
