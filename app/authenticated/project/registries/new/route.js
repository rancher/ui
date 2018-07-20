import Route from '@ember/routing/route';
import { get, set } from '@ember/object';

export default Route.extend({
  model(params/* , transition*/) {
    if (get(params, 'id')) {
      return get(this, 'store').find(get(params, 'type'), get(params, 'id'))
        .then( ( cred ) => cred.cloneForNew() );
    }

    return this.get('store').createRecord({
      type:       'dockerCredential',
      registries: {
        'index.docker.io': {
          username: '',
          password: '',
        }
      }
    });
  },

  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      set(controller, 'id', null);
      set(controller, 'type', null);
    }
  },
});
