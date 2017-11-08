import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  model: function() {
    var me = this.get(`session.${C.SESSION.ACCOUNT_ID}`);
    return hash({
      account: this.get('userStore').findAll('apikey', null, {filter: {accountId: me}, url: 'apikeys', forceReload: true}),
    });
  },
});
