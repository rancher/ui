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

  target: function() {
    return this.get('service') || this.get('instance');
  }.property('instance','service'),

  displayEndpoint: function() {
    let fqdn = this.get('fqdn');
    let bind = this.get('bindIpAddress');
    let agent = this.get('agentIpAddress');
    let port = this.get('publicPort');

    let out = '';
    if ( fqdn ) {
      out = fqdn;
    } else if ( bind && !BIND_ANY.includes(bind) ) {
      out = bind;
    } else if ( agent ) {
      out = agent;
    }

    if ( out && port !== 80 && port !== 443 ) {
      out += ':' + port; 
    }

    return out;
  }.property('fqdn','bindIpAddress','agentIpAddress','publicPort'),

  linkEndpoint: function() {
    if ( this.get('isMaybeHttp') ) {
      let out = this.get('displayEndpoint');

      if ( this.get('isMaybeSecure') ) {
        out = 'https://' + out;
      } else {
        out = 'http://' + out;
      }

      return out;
    }
  }.property('isMaybeHttp','isMaybeSecure','displayEndpoint'),

  isMaybeHttp: function() {
    return portMatch([this.get('publicPort'),this.get('privatePort')], [80,8080,3000,4567], '80');
  }.property('privatePort','publicPort'),

  isMaybeSecure: function() {
    return portMatch([this.get('publicPort'),this.get('privatePort')], [443,8443], '443');
  }.property('publicPort','publicPort'),
});

export default PublicEndpoint;
