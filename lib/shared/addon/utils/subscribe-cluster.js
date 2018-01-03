import EmberObject from '@ember/object';
import Subscribe from 'shared/mixins/subscribe';
import { get, set } from '@ember/object';

export default EmberObject.extend(Subscribe, {
  updateProjectStore: false,

  init() {
    this._super(...arguments);
    set(this, 'endpoint', get(this, 'app.clusterSubscribeEndpoint'));
  }
});
