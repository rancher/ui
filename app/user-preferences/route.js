import Ember from 'ember';
import { loadScript } from 'ui/utils/load-script';
import C from 'ui/utils/constants';
import fetch from 'ember-api-store/utils/fetch';

export default Ember.Route.extend({
  session: Ember.inject.service(),
  accountId: Ember.computed.alias(`session.${C.SESSION.ACCOUNT_ID}`),

  beforeModel() {
    return loadScript('https://js.stripe.com/v2/').then(() => {
      Stripe.setPublishableKey(this.get('app.stripe.publishableKey'));
      return Ember.RSVP.resolve();
    });
  },

  model(/*params, transition*/) {

    var modelOut = Ember.Object.create({
      account: null,
      stripeCards: null,
    });

    //only need to populate the passwords for the account right now
    return this.get('userStore').find('password').then((/* pwds */) => {

      return this.get('userStore').find('account', this.get('accountId')).then((resp) => {
        let stripeAccountId = null;
        if (resp.description && typeof resp.description === 'object') {
          stripeAccountId = JSON.parse(resp.description).stripeAccountId;
        }
        modelOut.account = resp;

        if (stripeAccountId) {
          return fetch(`/payment?type=stripe&accountId=${stripeAccountId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
          }).then((customer) => {
            modelOut.stripeCards = customer.body;
            return modelOut;
          }).catch(() => {
            return modelOut;
          });
        } else {
          return modelOut;
        }
      });
    });
  }
});
