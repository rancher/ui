import ApiError from 'ember-api-store/models/error';

export default {
  stringify(err) {
    var str;
    if ( typeof err === 'string' )
    {
      str = err;
    }
    else if ( err instanceof ApiError )
    {
      if ( err.get('status') === 422 )
      {
        str = 'Validation failed in API:';
        var something = false;
        if ( err.get('fieldName') )
        {
          str += ' ' + err.get('fieldName');
          something = true;
        }

        if ( err.get('detail') )
        {
          str += ' (' + err.get('detail') + ')';
          something = true;
        }

        if ( !something )
        {
          if ( err.get('message') )
          {
            str += ' ' + err.get('message');
            something = true;
          }
        }

        if ( !something )
        {
          str += ' (' + err.get('code') + ')';
        }

        switch ( err.get('code') )
        {
          case 'NotUnique':
            str += ' is not unique'; break;
        }
      }
      else
      {
        str = err.get('message');
        if ( err.get('detail') )
        {
          if ( str )
          {
            str += ' (' + err.get('detail') + ')';
          }
          else
          {
            str = err.get('detail');
          }
        }
      }
    }
    else if ( typeof err === 'object' )
    {
      if ( err.message )
      {
        str = err.message;
        if ( err.detail )
        {
          if ( str )
          {
            str += ' (' + err.detail + ')';
          }
          else
          {
            str = err.detail;
          }
        }
      }
      else if ( err.detail )
      {
        str = err.detail;
      }
    }
    else
    {
      // Good luck...
      str = err;
    }

    return str;
  },
};
