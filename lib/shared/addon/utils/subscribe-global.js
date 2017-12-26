import EmberObject from '@ember/object';
import Subscribe from 'shared/mixins/subscribe';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default EmberObject.extend(Subscribe, {
  init() {
    this._super(...arguments);
    set(this, 'endpoint', get(this, 'app.globalSubscribeEndpoint'));
  }
});
