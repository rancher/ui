import Ember from 'ember';
import { parsePortSpec } from 'ui/utils/parse-port';

export default Ember.Component.extend({
  intl:            Ember.inject.service(),

  service:         null,

  ports:           null,
  protocolChoices: null,
  errors:          null,
  editing:         true,
  showRules:       true,

  onInit: function() {
    let rules = this.get('service.lbConfig.portRules')||[];
    let ports = [];
    let store = this.get('store');

    rules.forEach((rule) => {
      let kind = 'service';
      let target = null;
      let name = '';

      if ( !!rule.selector ) {
        kind= 'selector';
      } else if ( rule.instanceId ) {
        kind = 'instance';
        target = store.getById(kind, rule.instanceId);
      } else if ( rule.serviceId ) {
        target = store.getById(kind, rule.serviceId);
      }

      if (target) {
        name = target.get('displayName');
      }

      rule.setProperties({
        kind: kind,
        targetName: name
      });
      rule.set('kind', kind);
    });

    (this.get('service.launchConfig.ports')||[]).forEach((str) => {
      let parsed = parsePortSpec(str,'http');
      let obj = Ember.Object.create({
        access: 'public',
        protocol: null,
        sourcePort: parsed.hostPort,
        sourceIp: parsed.hostIp,
        rules: [],
      });
      ports.push(obj);
    });

    (this.get('service.launchConfig.expose')||[]).forEach((str) => {
      let parsed = parsePortSpec(str,'http');
      let obj = Ember.Object.create({
        access: 'internal',
        protocol: null,
        sourcePort: parsed.hostPort,
        sourceIp: null,
        rules: [],
      });
      ports.push(obj);
    });

    // Filter the rules into the right port
    ports.forEach((obj) => {
      obj.set('rules',rules.filter((x) => {
        return x.sourcePort === obj.sourcePort
      }));
      obj.set('protocol', obj.get('rules.firstObject.protocol')||'http');
    });

    this.set('ports', ports);
    if ( ports.length === 0 ) {
      this.send('addPort');
    }

    let protos = this.get('store').getById('schema','portrule').optionsFor('protocol');
    protos.removeObject('udp');
    protos.sort();
    this.set('protocolChoices', protos);
  }.on('init'),

  shouldFlattenAndValidate: function() {
    Ember.run.once(this,'flattenAndValidate');
  }.observes('ports.@each.{sourcePort,protocol,access,sourceIp,rules}'),

  flattenAndValidate() {
    let intl = this.get('intl');
    let ports = this.get('ports');
    let errors = [];
    let rules = [];
    let publish = [];
    let expose = [];
    let seen = {};

    // Set ports and publish on the launch config
    // And also do a bunch of validation while we're here
    ports.forEach((port) => {
      // 1. Set expose/ports and ensure valid ports/protocols
      let srcStr = ((port.get('sourcePort')||'')+'').trim();
      if ( !srcStr ) {
        errors.push(intl.t('newBalancer.error.noSourcePort'));
        return;
      }

      let src = parseInt(srcStr,10);
      if ( !src || src < 1 || src > 65535 ) {
        errors.push(intl.t('newBalancer.error.invalidSourcePort', {num: srcStr}));
      }

      let sourceIp = port.get('sourceIp');
      let uniqueKey;
      if ( sourceIp ) {
        uniqueKey = '['+sourceIp+']:' + src;
      } else {
        uniqueKey = '[0.0.0.0]:' + src;
      }

      let access = port.get('access');
      let protocol = port.get('protocol');
      let id = access + '-' + protocol + '-' + src;

      if ( seen[uniqueKey] ) {
        if ( seen[uniqueKey] !== id ) {
          errors.push(intl.t('newBalancer.error.mixedPort', {num: src}));
          return;
        }
      } else {
        seen[uniqueKey] = id;
      }

      let entry = src+":"+src+"/"+ ( protocol === 'udp' ? 'udp' : 'tcp');
      if ( access === 'public' ) {
        // Source IP applies only to public rules
        if ( sourceIp ) {
          // IPv6
          if ( sourceIp.indexOf(":") >= 0 && sourceIp.substr(0,1) !== '[' ) {
            entry = '['+sourceIp+']:' + entry;
          } else {
            entry = sourceIp + ':' + entry;
          }
        }

        publish.push(entry);
      } else {
        expose.push(entry);
      }

      // 2. Set rules
      port.get('rules').forEach((rule) => {
        // The inner one eliminates null/undefined, then the outer one
        // converts integers to string (so they can be re-parsed later)
        let tgtStr = ((rule.get('targetPort')||'')+'').trim();
        if ( !tgtStr ) {
          errors.push(intl.t('newBalancer.error.noTargetPort'));
          return;
        }

        let tgt = parseInt(tgtStr,10);
        if ( !tgt || tgt < 1 || tgt > 65535 ) {
          errors.push(intl.t('newBalancer.error.invalidTargetPort', {num: tgtStr}));
          return;
        }

        if ( !rule.get('serviceId') && !rule.get('instanceId') && !rule.get('selector') ) {
          errors.push(intl.t('newBalancer.error.noTarget'));
        }

        // Make ports always numeric
        rule.setProperties({
          protocol: protocol,
          sourcePort: src,
          targetPort: tgt,
        });

        rules.push(rule);
      });
    });

    this.setProperties({
      'service.launchConfig.ports': publish.uniq(),
      'service.launchConfig.expose': expose.uniq(),
      'errors': errors.uniq(),
      'service.lbConfig.portRules': rules.sortBy('priority')
    });
  },

  actions: {
    addPort() {
      let port = Ember.Object.create({
        access: 'public',
        protocol: 'http',
        port: null,
        sourceIp: null,
        rules: [],
      });

      this.get('ports').pushObject(port);
    },

    removePort(port) {
      this.get('ports').removeObject(port);
    },

    rulesChanged() {
      this.shouldFlattenAndValidate();
    },
  },
});
