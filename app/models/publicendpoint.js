import { isArray } from '@ember/array';
import { get } from '@ember/object';
import Resource from 'ember-api-store/models/resource';
import { inject as service } from '@ember/service';

function portMatch(ports, equals, endsWith) {
  if (!isArray(ports)) {
    ports = [ports];
  }

  if (!isArray(equals)) {
    equals = [equals];
  }

  if (!isArray(endsWith)) {
    endsWith = [endsWith];
  }

  for (let i = 0; i < ports.length; i++) {
    let port = ports[i];
    if (equals.includes(port)) {
      return true;
    }

    for (let j = 0; j < endsWith.length; j++) {
      let suffix = endsWith[j] + '';
      let portStr = port + '';
      if (portStr !== suffix && portStr.endsWith(suffix)) {
        return true;
      }
    }
  }

  return false;
}

var PublicEndpoint = Resource.extend({
  globalStore: service(),

  portProto: function () {
    let out = this.get('port') + '/' + this.get('protocol').toLowerCase();
    return out;
  }.property('port', 'protocol'),

  // ip:port
  endpoint: function () {
    let out = '';

    if (get(this, 'address') === 'NodePort') {
      const store = get(this, 'globalStore');
      const nodes = store.all('node');
      const node = get(nodes, 'firstObject');
      const ipAddress = get(node, 'ipAddress');
      out = ipAddress;
    }

    if (out) {
      out += ':' + this.get('port');
    }

    return out;
  }.property('port', 'address'),

  // [ip:]port[/udp]
  displayEndpoint: function () {
    let out = '';
    out += this.get('port');
    let proto = this.get('protocol').toLowerCase();
    if (proto !== 'tcp') {
      out += '/' + proto;
    }
    return out;
  }.property('port', 'protocol'),

  linkEndpoint: function () {
    if (this.get('isTcp')) {
      let out = this.get('endpoint');

      if (this.get('isMaybeSecure')) {
        out = 'https://' + out.replace(/:443$/, '');
      } else {
        out = 'http://' + out.replace(/:80$/, '');
      }

      return out;
    }
  }.property('isTcp', 'isMaybeSecure', 'displayEndpoint'),

  isTcp: function () {
    return this.get('protocol').toLowerCase() === 'tcp';
  }.property('port', 'protocol'),

  isMaybeSecure: function () {
    return portMatch([this.get('port')], [443, 8443], '443');
  }.property('port'),
});

export default PublicEndpoint;
