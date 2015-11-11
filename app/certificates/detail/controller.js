import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    changeCertificate(cert) {
      this.get('application').transitionToRoute('certificate.detail', cert.get('id'));
    },
  },
});
