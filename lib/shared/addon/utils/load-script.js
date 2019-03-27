import { Promise as EmberPromise, resolve } from 'rsvp';
import { parseUrl } from './util';

let nextId = 1;

export function loadScript(url, id, timeout = 30000) {
  if ( !id ) {
    id = `loadScript-${  nextId }`;
    nextId++;
  }

  if ( $(`#${id}`).length > 0 )  {// eslint-disable-line
    return resolve(null, `Already loaded: ${  url }`);
  }

  return new EmberPromise(((resolve, reject) => {
    let timer = setTimeout(() => {
      reject({
        type:    'error',
        message: `Timeout loading ${  url }`
      });
    }, timeout);

    let script = document.createElement('script');

    script.onload  = function(arg) {
      clearTimeout(timer);
      resolve(arg);
    };
    script.onerror = function(arg) {
      script.remove();
      clearTimeout(timer);
      reject(arg);
    }
    script.src = url;
    script.id = id;
    document.getElementsByTagName('BODY')[0].appendChild(script);
  }));
}

export function loadStylesheet(url, id, timeout = 30000) {
  if ( !id ) {
    id = `loadStylesheet-${  nextId }`;
    nextId++;
  }

  if ( $(`#${id}`).length > 0 ) { // eslint-disable-line
    return resolve(null, `Already loaded: ${  url }`);
  }

  return new EmberPromise(((resolve, reject) => {
    let timer = setTimeout(() => {
      reject({
        type:    'error',
        message: `Timeout loading ${  url }`
      });
    }, timeout);

    let link     = document.createElement('link');

    link.onload  = function(arg) {
      clearTimeout(timer);
      resolve(arg);
    };
    link.onerror = function(arg) {
      link.remove();
      clearTimeout(timer);
      reject(arg);
    }
    link.rel = 'stylesheet';
    link.src = url;
    link.href = url;
    link.id = id;
    document.getElementsByTagName('HEAD')[0].appendChild(link);
  }));
}

export function proxifyUrl(url, proxyBase) {
  let parsed = parseUrl(url);

  if ( parsed.hostname.indexOf('.') === -1  || // No dot, local name like localhost
       parsed.hostname.toLowerCase().match(/\.local$/) || // your-macbook.local
       parsed.origin.toLowerCase() === window.location.origin // You are here
  ) {
    return url;
  } else {
    return  `${ proxyBase  }/${  url }`;
  }
}
