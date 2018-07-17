import EmberObject from '@ember/object';
import Subscribe from 'shared/mixins/subscribe';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';

export default EmberObject.extend(Subscribe, {
  updateProjectStore: false,

  scope:        service(),
  watchState:   true,
  watchStateOf: alias('scope.pendingCluster'),

  init() {
    this._super(...arguments);
    set(this, 'endpoint', get(this, 'app.clusterSubscribeEndpoint'));
  },

  validate() {
    const socket = get(this, 'subscribeSocket');
    const metadata = socket.getMetadata();
    const socketClusterId = get(metadata, 'clusterId');
    const currentClusterId = get(this, 'scope.currentCluster.id');

    if ( !currentClusterId || currentClusterId === socketClusterId ) {
      return true;
    } else {
      console.error(`${ this.label } Subscribe ignoring message, current=${ currentClusterId } socket=${ socketClusterId } ${  this.forStr() }`);

      return false;
    }
  }
});
