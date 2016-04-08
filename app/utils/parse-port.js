import Ember from 'ember';

// hostIp:hostPort:containerPort
// hostIp::containerPort
// hostPort:containerPort
// containerPort
export function parsePortSpec(str, defaultProtocol='http') {
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

export function stringifyPortSpec(port, defaultProtocol='http') {
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

// port
// 1.2.3.4
// 1.2.3.4:port
// long:ip:v6::str
// [long:ip:v6::str]
// [long:ip:v6::str]:port
export function parseIpPort(str) {
  str = str.trim();
  let colons = str.replace(/[^:]/g,'').length;
  let index;

  // IPv6, IPv6+port
  index = str.indexOf(']');
  if ( colons > 1 )
  {
    let index = str.indexOf(']');
    if ( index > 0 )
    {
      let ip = str.substr(0,index+1);
      let port = null;
      if ( str.substr(index+1,1) === ':' ) {
        port = portToInt(str.substr(index+2));
      }

      return ret(ip,port);
    }
    else
    {
      return ret('['+str+']',null);
    }
  }

  // IPv4+port
  index = str.indexOf(':');
  if ( index >= 0 )
  {
    return ret(str.substr(0,index), str.substr(index+1));
  }

  // IPv4
  if ( str.match(/[^\d]/) )
  {
    return ret(str,null);
  }

  // Port
  let port = portToInt(str);
  if ( port )
  {
    return ret(null,port);
  }

  return null;

  function ret(ip,port) {
    return  {
      ip: ip || null,
      port: portToInt(port)
    };
  }
}

export function portToInt(str) {
  str = (str+'').trim();
  if ( str.match(/^\d+$/) )
  {
    return parseInt(str,10) || null;
  }

  return null;
}

export default {
  parsePortSpec: parsePortSpec,
  stringifyPortSpec: stringifyPortSpec,
  parseIpPort: parseIpPort,
  portToInt: portToInt
};
