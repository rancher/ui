import Ember from 'ember';
import {
  parseTarget
}
from 'ui/utils/parse-target';

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
      this.setup();
    }
  },

  serviceObserver: function() {
    this.setup();
  }.observes('service'),

  setup: function() {
    var targets = [];
    this.get('service.consumedServicesWithNames').forEach((map) => {
      if (map.get('ports.length')) {
        map.get('ports').forEach((str) => {
          var obj = parseTarget(str);
          if (obj) {

            obj.setProperties({
              isService: true,
              environmentId: map.get('service.environmentId'),
              value: map.get('service.displayName'),
              id: map.get('service.id'),
              service: map.get('service'),
            });

            targets.pushObject(obj);
          }
        });
      } else {
        targets.pushObject(Ember.Object.create({
          isService: true,
          value: map.get('service.displayName'),
          id: map.get('service.id'),
          environmentId: map.get('service.environmentId'),
          service: map.get('service'),
        }));
      }
    });
    this.set('targetsArray', targets);

    this.get('store').findAllUnremoved('certificate').then((result) => {
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
