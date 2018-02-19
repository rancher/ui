import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { get } from '@ember/object'
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {
    const cs = get(this, 'globalStore');
    return hash({
      notifiers: cs.findAll('notifier').then(() => {
        return cs.all('notifier');
      }),
    });
  },
});
