import Service from '@ember/service';
import { getOwner } from '@ember/application';

export default Service.extend({
  // TODO 2.0 refactor to not be a pass through and allow the authenticated route to consume this service
  switchProject(id, path, opts) {
    let authenticated = getOwner(this).lookup('route:authenticated');
    authenticated.send('switchProject', id, path, opts);
  },
});
