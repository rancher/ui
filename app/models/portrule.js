import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

function setTlsPort() {
  if ( this.get('targetPort') ) {
    return;
  }

  let proto = this.get('protocol').toLowerCase();
  let src = parseInt(this.get('sourcePort'),10);
  let tgt = null;

  if ( (proto === 'http' && src === 80) || ( proto === 'https' && src === 443) ) {
    tgt = 80;
  } else if ( proto === 'sni' && src === 443 ) {
    tgt = 443;
  }

  if ( tgt ) {
    this.set('targetPort', tgt);
  }
}

let PortRule = Resource.extend({
  type: 'portRule',
  reservedKeys: ['access','isSelector'],

  service: denormalizeId('serviceId'),

  isTls: function() {
    return ['tls','https','sni'].includes(this.get('protocol'));
  }.property('protocol'),

  needsCertificate: function() {
    return ['tls','https'].includes(this.get('protocol'));
  }.property('protocol'),

  canHostname: function() {
    return ['http','https','sni'].includes(this.get('protocol'));
  }.property('protocol'),

  canPath: function() {
    return ['http','https'].includes(this.get('protocol'));
  }.property('protocol'),

  canSticky: Ember.computed.alias('canPath'),

  ipProtocol: function() {
    if ( this.get('protocol') === 'udp' ) {
      return 'udp';
    } else {
      return 'tcp';
    }
  }.property('protocol'),

  autoSetPort: function() {
    Ember.run.later(this, setTlsPort, 500);
  }.observes('protocol','sourcePort'),
});

export default PortRule;
