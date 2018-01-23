import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  model: function() {
    return hash({
      tokens: this.get('globalStore').findAll('token'),
    });
  },
});
