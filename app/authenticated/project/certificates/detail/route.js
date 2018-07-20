import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  model(params) {
    const all = this.modelFor('authenticated.project.certificates');

    let cert = all.projectCerts.findBy('id', params.certificate_id);

    if ( cert ) {
      return cert;
    }

    cert = all.namespacedCerts.findBy('id', params.certificate_id);
    if ( cert ) {
      return cert;
    }

    return get(this, 'store').find('certificate', params.certificate_id);
  },
});
