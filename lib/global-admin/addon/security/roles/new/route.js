import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model() {
    const store = get(this, 'globalStore');

    var role = store.createRecord({
      type: `roleTemplate`,
      name: '',
      rules: [],
    });

    return hash({
      roles: store.find('roleTemplate'),
      policies: store.find('podSecurityPolicyTemplate'),
    }).then((res) => {
      res.role = role;
      return res;
    });
  },
});
