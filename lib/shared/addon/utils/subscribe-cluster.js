import EmberObject from '@ember/object';
import Subscribe from 'shared/mixins/subscribe';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { alias } from '@ember/object/computed';

export default EmberObject.extend(Subscribe, {
  updateProjectStore: false,

  scope: service(),
  watchState: true,
  watchStateOf: alias('scope.currentCluster'),

  init() {
    this._super(...arguments);
    set(this, 'endpoint', get(this, 'app.clusterSubscribeEndpoint'));
  }
});
