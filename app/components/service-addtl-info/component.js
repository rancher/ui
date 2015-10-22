import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import C from 'ui/utils/constants';
import {
  parseTarget, stringifyTarget
}
from 'ui/utils/target-parser';


export default Ember.Component.extend(ReadLabels, {

  service: null,
  labelResource: Ember.computed.alias('service.launchConfig'),
  serviceContainers: null,
  listenersArray: null,
  targetsArray: null,
  defaultCert: null,
  secondaryCerts: null,

  tagName: 'div',

  classNames: ['service-addtl-info'],

  actions: {
    dismiss: function() {
      this.sendAction('dismiss');
    },
  },

  willInsertElement: function() {
    if (this.get('service.type') === 'loadBalancerService') {
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

      this.get('store').findAllUnremoved('certificate').then((result) =>{
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
    }
  },

  stateBackground: function() {
    return this.get('service.stateColor').replace("text-", "bg-");
  }.property('service.stateColor'),

  setup: Ember.on('init', function() {
    /* Need to filter the service containers when sidekicks are present cause they all just live in one object*/
    if (this.get('service.instances')) {
      this.set('serviceContainers', Ember.Object.create({}));
      this.get('service.instances').forEach((instance) => {
        /* if primary do things here */
        if (instance.get('labels')[C.LABEL.LAUNCH_CONFIG] === C.LABEL.LAUNCH_CONFIG_PRIMARY) {
          if (this.get('serviceContainers').hasOwnProperty('primary')) {
            this.get('serviceContainers.primary').pushObject(instance);
          } else {
            this.get('serviceContainers').set('primary', [instance]);
          }
        } else {
          /* not primary loop through secondary launch configs */
          this.get('service.secondaryLaunchConfigs').forEach((config) => {
            if (config.name === instance.get('labels')[C.LABEL.LAUNCH_CONFIG]) {
              if (config.hasOwnProperty('serviceContainers')) {
                config.get('serviceContainers').pushObject(instance);
              } else {
                config.set('serviceContainers', [instance]);
              }
            }
          });
        }
      });
    }


  }),

});
