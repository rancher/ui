import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function() {
    return hash({
      environment: this.get('store').findAll('apikey', null, {forceReload: true}),
    });
  },
});
