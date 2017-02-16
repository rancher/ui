import Ember from 'ember';
import { loadScript } from 'ui/utils/load-script';

export default Ember.Route.extend({
  beforeModel() {
    return loadScript('https://js.stripe.com/v2/').then(() => {
      Stripe.setPublishableKey(this.get('app.stripe.publishableKey'));
      return Ember.RSVP.resolve();
    });

  }
});
