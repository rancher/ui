import Service, { inject as service } from '@ember/service';

function parseValue(value) {
  if ( value.charAt(0) === '"' ) {
    value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\+/g, ' ');
  }

  return decodeURIComponent(value);
}

function getAll() {
  let cookies = document.cookie.split(/;\s*/);
  let ret = {};

  cookies.forEach((cookie) => {
    if ( !cookie ) {
      return;
    }

    let idx = cookie.indexOf('=');

    if ( idx === -1 ) {
      idx = cookie.length;
    }

    try {
      let name = decodeURIComponent(cookie.substr(0, idx));
      let val = parseValue(cookie.substr(idx + 1));

      ret[ name ] = val;
    } catch (e) {
    }
  });

  return ret;
}

export default Service.extend({
  app:             service(),
  unknownProperty(key) {
    let all = getAll();

    return all[key] || null;
  },

  setUnknownProperty(key, value) {
    if (key !== 'app') {
      this.setWithOptions(key, value);
    }

    return value;
  },

  // Opt: expire: date or number of days, path, domain, secure
  setWithOptions(name, value, opt) {
    opt =  opt || {};
    opt.path = (typeof opt.path === 'undefined' ? '/' : opt.path);

    if ( typeof opt.secure === 'undefined' || opt.secure === 'auto' ) {
      opt.secure = window.location.protocol === 'https:';
    } else {
      opt.secure = !!opt.secure;
    }

    let str = `${ encodeURIComponent(name)  }=${  encodeURIComponent(value) }`;

    if ( opt.expire ) {
      let date;

      if ( typeof (opt.expire) === 'object' ) {
        date = opt.expire;
      } else {
        date = new Date( (new Date()).getTime() + (86400000 * opt.expire));
      }

      str += `;expires=${  date.toGMTString() }`;
    }

    if ( opt.path ) {
      str += `;path=${  opt.path }`;
    }

    if ( opt.domain ) {
      str += `;domain=${  opt.domain }`;
    }

    if ( opt.secure ) {
      str += ';secure';
    }

    try {
      document.cookie = str;
    } catch ( e ) {
      return false;
    }

    this.notifyPropertyChange(name);

    return true;
  },

  remove(name, opt) {
    opt = opt || {};
    opt.expire = new Date('Wed, 24 Feb 1982 18:42:00 UTC');

    return this.setWithOptions(name, 'removed', opt);
  },
});
