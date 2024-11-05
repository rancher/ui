import _fetch from 'fetch';
import { reject } from 'rsvp'

export function fetch(url,opt) {
  opt = opt || {};
  if (!opt.credentials) {
    opt.credentials = 'same-origin';
  }

  if ( opt.data && !opt.body ) {
    opt.body = opt.data;
    delete opt.data;
  }

  return _fetch(url, opt).then(done);
}

function done(res) {
  let ct = '';
  if ( res && res.headers ) {
    ct = res.headers.get("content-type");
  }

  if ( res.status === 204 ) {
    return respond(res);
  } else {
    return res.text().then((body) => {
      if (body.length) {
        if (ct && ct.toLowerCase().indexOf("application/json") >= 0) {
          // return res.json().then(function(body) {
          return respond(res,JSON.parse(body));
          // });
        } else {
          return respond(res, body);
        }
      } else {
        // return res.text().then(function(body) {
        return respond(res, null);
        // });
      }
    });
  }
}

function respond(res, body) {
  let out = {
    body: body,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers
  };

  if (res.ok) {
    return out;
  } else {
    return reject(out);
  }
}

export default fetch;
