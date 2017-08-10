import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

const BIND_ANY = ['0.0.0.0','::'];

function portMatch(ports, equals, endsWith) {
  if ( !Ember.isArray(ports) ) {
    ports = [ports];
  }

  if ( !Ember.isArray(equals) ) {
    equals = [equals];
  }

  if ( !Ember.isArray(endsWith) ) {
    endsWith = [endsWith];
  }

  for ( let i = 0 ; i < ports.length ; i++ ) {
    let port= ports[i];
    if ( equals.includes(port) ) {
      return true;
    }

    for ( let j = 0 ; j < endsWith.length ; j++ ) {
      let suffix = endsWith[j]+'';
      let portStr = port+'';
      if ( portStr !== suffix && portStr.endsWith(suffix) ) {
        return true;
      }
    }
  }

  return false;
}

var PublicEndpoint = Resource.extend({
  instance: denormalizeId('instanceId'),
  service: denormalizeId('serviceId'),

  tls: null, // loadbalancerservice sets this based on the listener

  target: function() {
    return this.get('service') || this.get('instance');
  }.property('instance','service'),

  portProto: function() {
    let out = this.get('publicPort') + '/' + this.get('protocol');
    return out;
  }.property('publicPort','protocol'),

  hasBoundIp: function() {
    let bind = this.get('bindIpAddress');
    return bind && !BIND_ANY.includes(bind);
  }.property('bindIpAddress'),

  endpoint: function() {
    let out = '';
    let fqdn = this.get('fqdn');
    let agent = this.get('agentIpAddress');

    if ( fqdn ) {
      out = fqdn;
    } else if ( this.get('hasBoundIp') ) {
      out = this.get('bindIpAddress');
    } else if ( agent ) {
      out = agent;
    }

    if ( out ) {
      out += ':' + this.get('publicPort');
    }

    return out;
  }.property('fqdn','hasBoundIp','bindIpAddress','agentIpAddress','publicPort'),

  // always ip:port/proto
  displayEndpoint: function() {
    let out = this.get('endpoint');
    let proto = this.get('protocol');

    if ( proto !== 'tcp' ) {
      out += '/' + proto;
    }

    return out;
  }.property('endpoint','protocol'),

  linkEndpoint: function() {
    if ( this.get('isMaybeHttp') ) {
      let out = this.get('endpoint');

      if ( this.get('isMaybeSecure') ) {
        out = 'https://' + out.replace(/:443$/,'');
      } else {
        out = 'http://' + out.replace(/:80$/,'');
      }

      return out;
    }
  }.property('isMaybeHttp','isMaybeSecure','displayEndpoint'),

  isMaybeHttp: function() {
    return portMatch([this.get('publicPort'),this.get('privatePort')], [80,8080,3000,4567], '80');
  }.property('privatePort','publicPort'),

  isMaybeSecure: function() {
    let tls = this.get('tls');
    if ( tls !== null ) {
      return tls;
    }

    return portMatch([this.get('publicPort'),this.get('privatePort')], [443,8443], '443');
  }.property('tls','publicPort','publicPort'),
});

export default PublicEndpoint;
