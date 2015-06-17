import Ember from 'ember';

function parseValue(value) {
  if ( value.charAt(0) === '"' )
  {
    value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\+/g,' ');
  }

  return decodeURIComponent(value);
}

function getAll() {
  let cookies = document.cookie.split(/;\s*/);
  let ret = {};

  cookies.forEach((cookie) => {
    if ( !cookie )
    {
      return;
    }

    let idx = cookie.indexOf('=');

    if ( idx === -1 )
    {
      idx = cookie.length;
    }

    let name = decodeURIComponent(cookie.substr(0,idx));
    let val = parseValue(cookie.substr(idx+1));

    ret[ name ] = val;
  });

  return ret;
}

export default Ember.Service.extend({
  unknownProperty: function(key) {
    let all = getAll();
    return all[key] || null;
  },

  setUnknownProperty: function(key, value) {
    this.setWithOptions(key, value);
  },

  // Opt: expire: date or number of days, path, domain, secure
  setWithOptions: function(name, value, opt) {
    opt =  opt || {};
    opt.path = (typeof opt.path === 'undefined' ? '/' : opt.path);
    opt.secure = (typeof opt.path === 'undefined' ? false : !!opt.secure);

    let str = encodeURIComponent(name) + '=' + encodeURIComponent(value);

    if ( opt.expire )
    {
      let date;
      if ( typeof(opt.expire) === 'object' )
      {
        date = opt.expire;
      }
      else
      {
        date = new Date( (new Date()).getTime() + (86400000 * opt.expire));
      }

      str += ';expires=' + date.toGMTString();
    }

    if ( opt.path )
    {
      str += ';path=' + opt.path;
    }

    if ( opt.domain )
    {
      str += ';domain=' + opt.domain;
    }

    if ( opt.secure )
    {
      str += ';secure';
    }

    try
    {
      document.cookie = str;
    }
    catch ( e )
    {
      return false;
    }

    this.notifyPropertyChange(name);
    return true;
  },

  remove: function(name,opt)
  {
    opt = opt || {};
    opt.expire = new Date('Wed, 24 Feb 1982 18:42:00 UTC');
    return this.setWithOptions(name,'removed',opt);
  },
});
