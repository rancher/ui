import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params/*, transition*/) {
    return this.get('store').find('certificate', params.certificate_id).then((cert) => {
      return Ember.Object.create({
        certificate: cert,
        allCertificates: this.modelFor('certificates'),
      });
    });
  },
});
