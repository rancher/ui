import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  catalog: service(),
  store:   service(),

  model(params) {
    const store = get(this, 'store');

    return hash({ app: store.find('app', get(params, 'app_id')), });
  },
});
