import EmberObject from '@ember/object';

// hostIp:hostPort:containerPort
// hostIp::containerPort
// hostPort:containerPort
// containerPort
export function parsePortSpec(str, defaultProtocol = 'tcp') {
  str = str.trim();

  var match = str.match(/\/([a-z]+)$/i), parts, hostIp = '', hostPort, containerPort, protocol;

  // Protocol
  if ( match ) {
    protocol = match[1].toLowerCase();
    str = str.substr(0, str.length - match[0].length);
  } else {
    protocol = defaultProtocol;
  }

  // IPv6
  if ( (str.indexOf('[') >= 0) && (match = str.match(/^(\[[^]+\]):/)) ) {
    parts = str.substr(match[0].length).split(':');
    parts.unshift(match[1]);
  } else {
    parts = str.split(':');
  }

  if ( parts.length >= 3 ) {
    hostIp = parts[0];
    hostPort = parts[1];
    containerPort = parts[2];
  } else if ( parts.length === 2 ) {
    hostIp = null;
    hostPort = parts[0];
    containerPort = parts[1];
  } else {
    hostIp = null;
    hostPort = '';
    containerPort = parts[0];
  }

  return EmberObject.create({
    host:      (hostIp ? `${ hostIp  }:` : '') + hostPort,
    hostIp,
    hostPort:  parseInt(hostPort, 10) || null,
    container: parseInt(containerPort, 10) || null,
    protocol,
  });
}

export function portToInt(str) {
  str = (`${ str }`).trim();
  if ( str.match(/^\d+$/) ) {
    return parseInt(str, 10) || null;
  }

  return null;
}

export default { parsePortSpec, };
