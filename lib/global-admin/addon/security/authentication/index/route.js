import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  access:      service(),
  globalStore: service(),

  // TODO 2.0
  model() {
    var route = (this.get('access.provider') || '').toLowerCase().replace(/config$/i, '');

    if ( route === 'ldap' ) {
      route = 'activedirectory';
    }

    return get(this, 'globalStore').find('authconfig', null, { filter: { enabled: true } }).then((configs) => {
      if (get(configs, 'length') === 2) {
        let neuRt = configs.find((config) =>  get(config, 'id') !== 'local');

        this.replaceWith(`security.authentication.${  get(neuRt, 'id') }`);
      } else if (get(configs, 'length') > 2) {
        // ???
      } else {
        this.replaceWith('security.authentication.localauth');
      }
    })
  },
});
