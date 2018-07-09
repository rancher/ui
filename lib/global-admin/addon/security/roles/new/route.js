import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:         service(),
  roleTemplateService: service('roleTemplate'),

  model() {

    const store = get(this, 'globalStore');

    var role = store.createRecord({
      type:   `roleTemplate`,
      name:   '',
      rules:  [],
      hidden: false,
      locked: false,
    });

    return hash({
      policies: store.find('podSecurityPolicyTemplate'),
      roles:    get(this, 'roleTemplateService').fetchFilteredRoleTemplates(),
    }).then( (res) => {

      set(res, 'role', role);

      return res;

    });

  },
});
