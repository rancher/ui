import Ember from 'ember';

export function parsePort(str, defaultProtocol='http') {
  str = str.trim();

  var host, container, protocol;

  var match = str.match(/^(\d+)(:(\d+))?(\/([a-z]+))?/i);
  if ( !match )
  {
    return null;
  }

  host = parseInt(match[1],10);
  if ( match[3] )
  {
    container = parseInt(match[3], 10);
  }
  else
  {
    container = host;
  }

  if ( match[5] )
  {
    protocol = (match[5]+'').toLowerCase();
  }
  else
  {
    protocol = defaultProtocol;
  }

  return Ember.Object.create({
    host: host,
    container: container,
    protocol: protocol,
  });
}

export function stringifyPort(port, defaultProtocol='http') {
  var host = Ember.get(port,'host');
  var container = Ember.get(port,'container');
  var protocol = Ember.get(port,'protocol');

  var out = host;
  if ( container && host !== container )
  {
    out += ':' + container;
  }

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
