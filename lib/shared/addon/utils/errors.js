import ApiError from 'ember-api-store/models/error';
import { get } from '@ember/object';

export default {
  stringify(err) {
    var str;

    if ( typeof err === 'string' ) {
      str = err;
    } else if ( err instanceof ApiError ) {
      if ( err.get('code') === 'ActionNotAvailable' ) {
        str = 'This action is not currently available';
      } else if ( err.get('status') === 422 ) {
        str = 'Validation failed in API:';
        var something = false;

        if ( err.get('fieldName') ) {
          str += ` ${  err.get('fieldName') }`;
          something = true;
          if ( err.get('message') ) {
            str += ` ${  err.get('message') }`;
          }
        }

        if ( err.get('detail') ) {
          str += ` (${  err.get('detail')  })`;
          something = true;
        }

        if ( !something ) {
          if ( err.get('message') ) {
            str += ` ${  err.get('message') }`;
            something = true;
          }
        }

        if ( !something ) {
          str += ` (${  err.get('code')  })`;
        }

        switch ( err.get('code') ) {
        case 'MissingRequired':
          str += ' is required'; break;
        case 'NotUnique':
          str += ' is not unique'; break;
        case 'NotNullable':
          str += ' must be set'; break;
        case 'InvalidOption':
          str += ' is not a valid option'; break;
        case 'InvalidCharacters':
          str += ' contains invalid characters'; break;
        case 'MinLengthExceeded':
          str += ' is not long enough'; break;
        case 'MaxLengthExceeded':
          str += ' is too long'; break;
        case 'MinLimitExceeded':
          str += ' is too small'; break;
        case 'MaxLimitExceded':
          str += ' is too big'; break;
        }
      } else if ( err.get('status') === 404 ) {
        str = `${ err.get('message')  }`;

        if (get(err, 'opt')) {
          str = `: ${  err.get('opt.url') }`;
        }
      } else {
        str = err.get('message');
        if ( err.get('detail') ) {
          if ( str ) {
            str += ` (${  err.get('detail')  })`;
          } else {
            str = err.get('detail');
          }
        }
      }
    } else if ( typeof err === 'object' ) {
      if ( err.message ) {
        str = err.message;
        if ( err.detail ) {
          if ( str ) {
            str += ` (${  err.detail  })`;
          } else {
            str = err.detail;
          }
        }
      } else if ( err.detail ) {
        str = err.detail;
      }
    } else {
      // Good luck...
      str = err;
    }

    return str;
  },
};
