import EmberObject, { get } from '@ember/object';

// New Format: [hostname][:srcPort][/path][=dstPort]
// Older format: dstPort:[hostname][/path]
export function parseTarget(str) {
  var srcPort = null, dstPort = null, hostname = null, path = null;

  str = str.trim();

  var match = str.match(/^(\d+)$/);

  if ( match ) {
    // New Format: just a dstPort
    hostname = null;
    srcPort = null;
    path = null;
    dstPort = parseInt(match[1], 10);
  } else if ( str.indexOf('=') === -1 && (match = str.match(/^(\d+):([^\/]+)?(\/.*)?$/)) ) {
    // Old Format: dstPort[:hostname][:srcPort][/path]
    hostname = match[2] || null;
    if ( hostname ) {
      var idx = hostname.indexOf(':');

      if ( hostname && idx >= 0 ) {
        srcPort = parseInt(hostname.substr(idx + 1), 10);
        hostname = hostname.substr(0, idx);
      }
    }

    path = match[3] || null;
    dstPort = parseInt(match[1], 10);
  } else if ( match = str.match(/^([^/=:]+)?(:(\d+))?(\/[^=]+)?(=(\d+))?$/) ) { // eslint-disable-line
    // New Format: [hostname][:srcPort][/path][=dstPort]
    if ( match[1] && match[1].match(/^\d+$/) && !match[2] ) {
      // It's a port
      hostname = null;
      srcPort = parseInt(match[1], 10) || null;
    } else {
      hostname = match[1] || null;
      srcPort = parseInt(match[3], 10) || null;
    }

    dstPort = parseInt(match[6], 10) || null;
    path = match[4] || null;
  } else {
    return null;
  }

  return EmberObject.create({
    hostname,
    srcPort,
    dstPort,
    path
  });
}

export function stringifyTarget(tgt) {
  var srcPort = get(tgt, 'srcPort');
  var dstPort = get(tgt, 'dstPort');
  var hostname = get(tgt, 'hostname');
  var path = get(tgt, 'path');

  // New Format: [hostname][:srcPort][/path][=dstPort]
  if ( hostname || path || dstPort ) {
    var str = hostname || '';

    if ( srcPort ) {
      str += (str ? ':' : '') + srcPort;
    }

    if ( path ) {
      str += (path.substr(0, 1) === '/' ? '' : '/') + path;
    }

    if ( dstPort ) {
      str += (str ? '=' : '') + dstPort;
    }

    return str;
  } else {
    return null;
  }
}

export default {
  parseTarget,
  stringifyTarget,
};
