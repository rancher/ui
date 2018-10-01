import Mixin from '@ember/object/mixin';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import Errors from 'shared/utils/errors';

export default Mixin.create({
  access: service(),
  growl:  service(),

  preload(type, storeName = 'store', opt = null) {
    return get(this, storeName).find(type, null, opt);
  },

  loadSchemas(storeName) {
    var store = get(this, storeName);

    store.resetType('schema');

    return store.rawRequest({
      url:      'schema',
      dataType: 'json'
    }).then((xhr) => {
      store._state.foundAll['schema'] = true;
      store._bulkAdd('schema', xhr.body.data);
    });
  },

  loadingError(err, transition) {
    let isAuthFail = err && err.status && [401, 403].includes(err.status);

    var msg = Errors.stringify(err);

    console.log('Loading Error:', msg, err);
    if ( isAuthFail ) {
      set(this, 'access.enabled', true);
      this.send(this, 'logout', transition, isAuthFail, (isAuthFail ? undefined : msg));
    } else {
      get(this, 'growl').fromError(err);
      this.replaceWith('global-admin.clusters');
    }
  },
});
