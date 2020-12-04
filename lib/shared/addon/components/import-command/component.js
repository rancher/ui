import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';

const CLUSTER_ADMIN = 'kubectl create clusterrolebinding cluster-admin-binding --clusterrole cluster-admin --user [USER_ACCOUNT]';

export default Component.extend({
  settings: service(),
  growl:    service(),

  layout,

  cluster:                 null,
  clusterAdmin:            CLUSTER_ADMIN,
  showClusterAdminWarning: true,
  showEksClusterWarning:   false,
  loading:                 true,
  token:                   null,

  init() {
    this._super(...arguments);

    this.loadToken();
  },

  loadToken() {
    const cluster = get(this, 'cluster');

    if (!cluster) {
      return;
    }

    set(this, 'loading', true);

    return cluster.getOrCreateToken().then((token) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      setProperties(this, {
        token,
        loading: false,
      });
    }).catch((err) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      get(this, 'growl').fromError('Error getting command', err);
      set(this, 'loading', false);
    });
  }
});
