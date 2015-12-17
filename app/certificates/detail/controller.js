import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    changeCertificate(cert) {
      this.transitionToRoute('certificates.detail', cert.get('id'));
    },
  },
});
