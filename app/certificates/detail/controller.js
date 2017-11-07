import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    changeCertificate(cert) {
      this.transitionToRoute('certificates.detail', cert.get('id'));
    },
  },
});
