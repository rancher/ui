import Service from '@ember/service';
import { get } from '@ember/object';

export default Service.extend({
  unknownProperty(key) {
    return  get(this, `app.${ key }`);
  },
});
