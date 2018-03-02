import { isArray } from '@ember/array';
import { get, computed } from '@ember/object';
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
  scope: service(),

  portProto: computed('port', 'protocol', function () {
    let out = get(this,'port') + '/' + get(this,'protocol').toLowerCase();
    return out;
  }),

  // ip:port
  endpoint: computed('port', 'address', function() {
    const address = get(this, 'address');

    let out = '';
    if ( address && address !== 'NodePort' ) {
      out = address;
    } else {
      const globalStore = get(this, 'globalStore');
      const node = globalStore.all('node').findBy('clusterId', get(this,'scope.currentCluster.id'));
      if ( node ) {
        out = get(node, 'ipAddress');
      }
    }

    if (out) {
      out += ':' + get(this,'port');
    }

    return out;
  }),

  // [ip:]port[/udp]
  displayEndpoint: computed('port','protocol', function() {
    let out = '';
    out += get(this,'port');
    let proto = get(this,'protocol').toLowerCase();
    if (proto !== 'tcp') {
      out += '/' + proto;
    }
    return out;
  }),

  linkEndpoint: computed('isTcp', 'isMaybeSecure', 'displayEndpoint', function() {
    if (get(this,'isTcp')) {
      let out = get(this,'endpoint');

      if (get(this,'isMaybeSecure')) {
        out = 'https://' + out.replace(/:443$/, '');
      } else {
        out = 'http://' + out.replace(/:80$/, '');
      }

      return out;
    }
  }),

  isTcp: computed('protocol', function() {
    return get(this,'protocol').toLowerCase() === 'tcp';
  }),

  isMaybeSecure: computed('port', function() {
    return portMatch([get(this,'port')], [443, 8443], '443');
  }),
});

export default PublicEndpoint;
