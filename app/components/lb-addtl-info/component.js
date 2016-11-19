import Ember from 'ember';

export default Ember.Component.extend({
  service: null,
  containers: null,
  listenersArray: null,
  targetsArray: null,
  defaultCert: null,
  secondaryCerts: null,

  tagName: '',

  willInsertElement: function() {
    if (this.get('service')) {
      this.bootstrap();
    }
  },

  serviceObserver: function() {
    this.bootstrap();
  }.observes('service'),

  targets: Ember.computed.alias('service.lbConfig.portRules'),

  bootstrap: function() {
    this.get('store').findAll('certificate').then((result) => {
      result.forEach((cert) => {
        if (this.get('service.defaultCertificateId') === cert.id) {
          this.set('defaultCert', cert);
        } else {
          if (!this.get('secondaryCerts')) {
            this.set('secondaryCerts', []);
          }
          if (this.get('service.certificateIds')) {
            if (this.get('service.certificateIds').indexOf(cert.id) !== -1) {
              this.get('secondaryCerts').pushObject(cert);
            }
          }
        }
      });
    });
  },
});
