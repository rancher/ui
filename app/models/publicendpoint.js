import { isArray } from '@ember/array';
import { get, computed } from '@ember/object';
import Resource from '@rancher/ember-api-store/models/resource';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

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
      let suffix = `${ endsWith[j]  }`;
      let portStr = `${ port  }`;

      if (portStr !== suffix && portStr.endsWith(suffix)) {
        return true;
      }
    }
  }

  return false;
}

var PublicEndpoint = Resource.extend({
  globalStore: service(),
  scope:       service(),
  settings:    service(),

  portProto: computed('port', 'protocol', function() {
    let out = `${ get(this, 'port')  }/${  get(this, 'protocol').toLowerCase() }`;

    return out;
  }),

  // ip:port
  endpoint: computed('port', 'addresses', 'allNodes', 'isIngress', 'hostname', function() {
    const addresses = get(this, 'addresses');
    const allNodes = get(this, 'allNodes');
    const hostname = get(this, 'hostname') || '';

    let out = '';

    if (get(this, 'isIngress') && hostname !== '' ) {
      out = hostname;
    } else if ( addresses && addresses.length ) {
      out = addresses[0];
    } else if ( allNodes ) {
      const globalStore = get(this, 'globalStore');
      const nodes = globalStore.all('node').filterBy('clusterId', get(this, 'scope.currentCluster.id'));
      let node = nodes.findBy('externalIpAddress');

      if ( node ) {
        out = get(node, 'externalIpAddress');
      } else {
        node = nodes.findBy('ipAddress');
        if ( node ) {
          out = get(node, 'ipAddress');
        }
      }
    }

    if (out) {
      out += `:${  get(this, 'port') }`;
    }

    return out;
  }),

  // port[/udp]
  displayEndpoint: computed('port', 'protocol', 'path', function() {
    let path = get(this, 'path') || '';

    if ( path && path !== '/' ) {
      return path;
    }

    let out = '';

    out += get(this, 'port');
    let proto = get(this, 'protocol').toLowerCase();

    out += `/${  proto }`;

    return out;
  }),

  linkEndpoint: computed('isTcpish', 'isMaybeSecure', 'displayEndpoint', 'port', 'isIngress', 'path', function() {
    let path = get(this, 'path') || '';

    if (get(this, 'isTcpish') && get(this, 'port') > 0 ) {
      let out = get(this, 'endpoint');

      if (get(this, 'isMaybeSecure')) {
        out = `https://${  out.replace(/:443$/, '') }`;
      } else {
        out = `http://${  out.replace(/:80$/, '') }`;
      }

      if (get(this, 'isIngress')) {
        out = out + path;
      }

      return out;
    }
  }),

  isTcpish: computed('protocol', function() {
    const proto = get(this, 'protocol').toLowerCase();

    return ( ['tcp', 'http', 'https'].includes(proto) );
  }),

  isMaybeSecure: computed('port', 'protocol', function() {
    const proto = get(this, 'protocol').toLowerCase();

    return portMatch([get(this, 'port')], [443, 8443], '443') || proto === 'https';
  }),

  isIngress: computed('ingressId', function(){
    return get(this, 'ingressId') !== '' && get(this, 'ingressId') !== null;
  }),

  isReady: computed('hostname', function(){
    const xip = get(this, `settings.${ C.SETTING.INGRESS_IP_DOMAIN }`);
    const hostname = get(this, 'hostname') || '';

    if ( get(this, 'isIngress') ){
      if ( xip === hostname ){
        return false
      }
    }

    return true
  }),
});

export default PublicEndpoint;
