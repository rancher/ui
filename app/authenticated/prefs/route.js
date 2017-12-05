import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { loadScript } from 'ui/utils/load-script';
import C from 'ui/utils/constants';
import fetch from 'ember-api-store/utils/fetch';

export default Route.extend({
  session:   service(),
  accountId: alias(`session.${C.SESSION.ACCOUNT_ID}`),
  scope:     service(),

  beforeModel() {
    return loadScript('https://js.stripe.com/v2/').then(() => {
      Stripe.setPublishableKey(this.get('app.stripe.publishableKey'));
      return resolve();
    });
  },

  model(/*params, transition*/) {

    var modelOut = EmberObject.create({
      account: null,
      stripeCards: null,
    });

    //only need to populate the passwords for the account right now
    return this.get('globalStore').find('password').then((/* pwds */) => {

      return this.get('globalStore').find('account', this.get('accountId')).then((resp) => {
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
  },
});
