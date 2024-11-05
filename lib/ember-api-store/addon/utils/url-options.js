import { isArray } from '@ember/array';

export function urlOptions(url,opt,cls) {
  opt = opt || {};

  // Filter
  // @TODO friendly support for modifiers
  if ( opt.filter )
  {
    var keys = Object.keys(opt.filter);
    keys.forEach(function(key) {
      var vals = opt.filter[key];
      if ( !isArray(vals) )
      {
        vals = [vals];
      }

      vals.forEach(function(val) {
        url += (url.indexOf('?') >= 0 ? '&' : '?') + encodeURIComponent(key) + '=' + encodeURIComponent(val);
      });
    });
  }
  // End: Filter


  // Limit
  let limit = opt.limit;
  if ( !limit && cls ) {
    limit = cls.constructor.defaultLimit;
  }

  if ( limit )
  {
    url += (url.indexOf('?') >= 0 ? '&' : '?') + 'limit=' + limit;
  }
  // End: Limit


  // Sort
  var sortBy = opt.sortBy;
  if ( !sortBy && cls )
  {
    sortBy = cls.constructor.defaultSortBy;
  }

  if ( sortBy )
  {
    url += (url.indexOf('?') >= 0 ? '&' : '?') + 'sort=' + encodeURIComponent(sortBy);
  }

  var orderBy = opt.sortOrder;
  if ( !orderBy && cls )
  {
    orderBy = cls.constructor.defaultSortOrder;
  }

  if ( orderBy )
  {
    url += (url.indexOf('?') >= 0 ? '&' : '?') + 'order=' + encodeURIComponent(orderBy);
  }
  // End: Sort

  return url;
}

export default urlOptions;
