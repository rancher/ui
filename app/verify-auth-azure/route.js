import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';
import VerifyAuth from 'ui/mixins/verify-auth';

export default Route.extend(VerifyAuth, {
  azureAd: service(),


  model(params/* , transition */) {

    if (window.opener) {
      const stateMsg         = 'Authorization state did not match, please try again.';

      if (get(params, 'code') && window.opener.window.onAzureTest) {

        reply(null, get(params, 'code'));

      } else {

        reply(stateMsg);

      }

    }

    if (get(params, 'code') && !window.opener) {


      let azureProvider = get(this, 'access.providers').findBy('id', 'azure');

      return azureProvider.doAction('login', {
        code:         get(params, 'code'),
        description:  C.SESSION.DESCRIPTION,
        responseType: 'cookie',
        ttl:          C.SESSION.TTL,
      }).then(() => {

        return this.transitionTo('authenticated');
      });

    }

    function reply(err,code) {

      const opener = window.opener.window;

      if (opener.onAzureTest) {

        opener.onAzureTest(err,code);

        setTimeout(function() {
          window.close();
        },250);

        return new RSVP.promise();

      } else {

        window.close();

      }
    }
  }
});
