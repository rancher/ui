import Ember from 'ember';
import Util from 'ui/utils/util';

export function parseRequestLine(str) {
  str = (str||'').trim();
  var out = null;
  var match;

  if ( str.indexOf('"') > 0 )
  {
    //haproxy 1.6+ with quoted request
    //                 METHOD     "path"   "HTTP/1.x\\r\\nHost: Blah"
    match = str.match(/([^\s]+)\s+"?([^"]+)"?\s+"?(HTTP\/[0-9\.]+)([^"]*)"?/);
    if ( match )
    {
      out = {
        method: match[1],
        path: match[2],
        version: match[3],
        headers: parseHeaders(match[4].replace(/(\\r)?\\n/g,'\r\n').trim())
      };
    }
  }
  else
  {
    //haproxy <= 1.5
    var lines = str.split(/[\r\n]+/);
    match = lines[0].match(/^([^\s]+)\s+(.*)\s+(HTTP\/[0-9\.]+)/);
    if ( match )
    {
      out = {
        method: match[1],
        path: match[2],
        version: match[3],
        headers: parseHeaders(lines.slice(1)),
      };
    }
  }

  return out;
}

export function canonicalHeader(str) {
  return (str||'')
    .toLowerCase()
    .split('-')
    .map(Util.ucFirst)
    .join('-');
}

export function parseHeaders(strOrArray) {
  var out = {};

  var ary;
  if ( Ember.isArray(strOrArray) )
  {
    ary = strOrArray;
  }
  else
  {
    ary = (strOrArray||'').split(/(\r?\n)+/);
  }

  ary.forEach((line) => {
    let pos = line.indexOf(':');
    if ( pos > 0)
    {
      let key = canonicalHeader(line.substr(0,pos)).trim();
      let val = line.substr(pos+1).trim();
      if ( val )
      {
        if ( out[key] )
        {
          out[key] = out[key] + ',' + val;
        }
        else
        {
          out[key] = val;
        }
      }
    }
  });

  return out;
}

export default {
  parseRequestLine: parseRequestLine,
  parseHeaders: parseHeaders,
  canonicalHeader: canonicalHeader
};
