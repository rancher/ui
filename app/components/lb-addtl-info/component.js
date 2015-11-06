import Ember from 'ember';
import {
  parseTarget
}
from 'ui/utils/parse-target';

export default Ember.Component.extend({
  service: null,
  serviceContainers: null,
  listenersArray: null,
  targetsArray: null,
  defaultCert: null,
  secondaryCerts: null,

  tagName: '',

  willInsertElement: function() {
    this.setup();
  },

  serviceObserver: function() {
    this.setup();
  }.observes('service'),

  setup: function() {
    this.get('service').importLink('loadBalancerListeners').then(() => {
      var out = [];
      this.get('service.loadBalancerListeners').forEach((l) => {
        var protocol = l.get('sourceProtocol');
        var ssl = false;
        if (protocol === 'https') {
          ssl = true;
          protocol = 'http';
        } else if (protocol === 'ssl') {
          ssl = true;
          protocol = 'tcp';
        }

        out.push({
          type: 'loadBalancerListener',
          name: 'uilistener',
          isPublic: !!l.get('sourcePort'),
          sourcePort: l.get('sourcePort') ? l.get('sourcePort') : l.get('privatePort'),
          sourceProtocol: protocol,
          ssl: ssl,
          targetPort: l.get('targetPort'),
        });
      });
      this.set('listenersArray', out.sortBy('sourcePort'));
    });

    var targets = [];
    this.get('service.consumedServicesWithNames').forEach((map) => {
      if (map.get('ports.length')) {
        map.get('ports').forEach((str) => {
          var obj = parseTarget(str);
          if (obj) {

            obj.setProperties({
              isService: true,
              value: map.get('service.id'),
            });

            targets.pushObject(obj);
          }
        });
      } else {
        targets.pushObject(Ember.Object.create({
          isService: true,
          value: map.get('service.id'),
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
