import { get } from '@ember/object';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  globalStore: service(),

  isFeatureEnabled(name) {
    return get(this, 'globalStore')
      .all('feature')
      .filterBy('name', name)
      .get('firstObject.value');
  }
});