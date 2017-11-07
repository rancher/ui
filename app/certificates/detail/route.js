import EmberObject from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model: function(params/*, transition*/) {
    return this.get('store').find('certificate', params.certificate_id).then((cert) => {
      return EmberObject.create({
        certificate: cert,
        allCertificates: this.modelFor('certificates'),
      });
    });
  },
});
