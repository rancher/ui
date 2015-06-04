var Cookie = {
  set: function(name,value,expire,path,domain,secure) {
    var expire_date;
    if ( typeof(expire) === 'object' )
    {
      expire_date = expire;
    }
    else if ( expire )
    {
      expire_date = new Date( (new Date()).getTime() + (86400000 * expire));
    }

    var str = name +'=' + value.replace(/ /g,'%20').replace(/,/g,'%2C').replace(/;/g,'%3B');

    if ( expire )
    {
      str += ';expires=' + expire_date.toGMTString();
    }

    if ( path )
    {
      str += ';path=' + path;
    }

    if ( domain )
    {
      str += ';domain=' + domain;
    }

    if ( secure )
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
    return true;
  },

  get: function(name) {
    var all = Cookie.getAll();

    if ( typeof( all[name] ) === 'undefined' )
    {
      return false;
    }

    return all[name];
  },

  getAll: function() {
    var cookies = document.cookie.split(/;\s*/);
    var tmp,name,val;
    var ret = {};

    for ( var i = 0 ; i < cookies.length ; i++ )
    {
      tmp = cookies[i].split(/=/);
      name = tmp[0].trim();

      if ( !name )
      {
        continue;
      }

      if ( tmp.length > 1 )
      {
        val = decodeURIComponent(tmp[1].trim());
      }
      else
      {
        val = '';
      }

      ret[ name ] = val;
    }

    return ret;
  },

  remove: function(name)
  {
    document.cookie = name+'=null; expires=Wed, 24 Feb 1982 18:42:00 UTC';
  },
};

export default Cookie;
