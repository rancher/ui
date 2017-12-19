import Service from '@ember/service';
import { get, set } from '@ember/object';

export default Service.extend({
  unknownProperty: function(key) {
    console.log('getting app key:', key, get(this, `app.${key}`));
    return  get(this, `app.${key}`);
  },
});
