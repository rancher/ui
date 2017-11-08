import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  projects: service(),
  k8s: service(),

  model() {
    return hash({
      stacks: this.get('store').find('stack'),
    }).then((hash) => {
      return EmberObject.create(hash);
    });
  },
});
