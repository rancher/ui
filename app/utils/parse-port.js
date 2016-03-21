import Ember from 'ember';

// hostIp:hostPort:containerPort
// hostIp::containerPort
// hostPort:containerPort
// containerPort
export function parsePort(str, defaultProtocol='http') {
  console.log("ParsePort:", str, defaultProtocol);
  str = str.trim();

  var match, parts, hostIp = '', hostPort, containerPort, protocol;

  // Protocol
  if ( match = str.match(/\/([a-z]+)$/i) )
  {
    protocol = match[1].toLowerCase();
    str = str.substr(0, str.length - match[0].length);
  }
  else
  {
    protocol = defaultProtocol;
  }

  // IPv6
  if ( (str.indexOf('[') >= 0) && (match = str.match(/^(\[[^]+\]):/)) )
  {
    parts = str.substr(match[0].length).split(':');
    parts.unshift(match[1]);
  }
  else
  {
    parts = str.split(':');
  }

  if ( parts.length >= 3 )
  {
    hostIp = parts[0];
    hostPort = parts[1];
    containerPort = parts[2];
  }
  else if ( parts.length === 2 )
  {
    hostIp = null;
    hostPort = parts[0];
    containerPort = parts[1];
  }
  else
  {
    hostIp = null;
    hostPort = "";
    containerPort = parts[0];
  }

  return Ember.Object.create({
    host: (hostIp ? hostIp + ':' : '') + hostPort,
    hostIp: hostIp,
    hostPort: parseInt(hostPort,10)||null,
    container: parseInt(containerPort,10)||null,
    protocol: protocol,
  });
}

export function stringifyPort(port, defaultProtocol='http') {
  var hostStr = Ember.get(port,'host')||'';
  var match, hostIp, hostPort;
  if ( match = hostStr.match(/^((.*):)?([^:]+)$/) )
  {
    hostIp = match[2];
    hostPort = match[3];
  }
  else
  {
    hostIp = null;
    hostPort = hostStr;
  }

  var container = Ember.get(port,'container');
  var protocol = Ember.get(port,'protocol');

  var out = '';
  if ( hostPort )
  {
    out = (hostIp ? hostIp+':' : '') + hostPort + ':';
  }

  out += container;

  if ( protocol && (!defaultProtocol || protocol !== defaultProtocol) )
  {
    out += '/' + protocol;
  }

  return out;
}

export default {
  parsePort: parsePort,
  stringifyPort: stringifyPort,
};
