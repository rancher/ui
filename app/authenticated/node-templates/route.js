import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function() {
    return hash({
      nodeTemplates: this.get('globalStore').findAll('nodeTemplate'),
    });
  },
});
