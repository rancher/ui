import { get } from '@ember/object';

const SEARCH_FIELDS = ['displayName', 'id:prefix', 'displayState'];

export function matches(fields, token, item) {
  let tokenMayBeIp = /^[0-9a-f\.:]+$/i.test(token);

  for ( let i = 0 ; i < fields.length ; i++ ) {
    let field = fields[i];

    if ( field ) {
      // Modifiers:
      //  id: The token must match id format (i.e. 1i123)
      let idx = field.indexOf(':');
      let modifier = null;

      if ( idx > 0 ) {
        modifier = field.substr(idx + 1);
        field = field.substr(0, idx);
      }

      let val = get(item, field);

      if ( val === undefined ) {
        continue;
      }

      val = (`${ val }`).toLowerCase();
      if ( !val ) {
        continue;
      }

      switch ( modifier ) {
      case 'exact':
        if ( val === token ) {
          return true;
        }

        break;
      case 'ip':
        if ( tokenMayBeIp ) {
          let re = new RegExp(`(?:^|\.)${  token  }(?:\.|$)`);

          if ( re.test(val) ) {
            return true;
          }
        }

        break;
      case 'prefix':
        if ( val.indexOf(token) === 0) {
          return true;
        }

        break;
      default:
        if ( val.indexOf(token) >= 0) {
          return true;
        }

        break;
      }
    }
  }

  return false;
}

export function filter(out, searchText, searchFields = SEARCH_FIELDS, subFields, subSearchField) {
  let subMatches     = null;

  searchText = (searchText || '').trim().toLowerCase();

  if ( searchText.length ) {
    subMatches = {};

    let searchTokens = searchText.split(/\s*[, ]\s*/);

    for ( let i = out.length - 1 ; i >= 0 ; i-- ) {
      let row = out[i];
      let hits      = 0;
      let mainFound = true;

      for ( let j = 0 ; j < searchTokens.length ; j++ ) {
        let expect = true;
        let token = searchTokens[j];

        if ( token.substr(0, 1) === '!' ) {
          expect = false;
          token = token.substr(1);
        }

        if ( token && matches(searchFields, token, row) !== expect ) {
          mainFound = false;

          break;
        }
      }

      if ( subFields && subSearchField ) {
        let subRows = (row.get(subSearchField) || []);

        for ( let k = subRows.length - 1 ; k >= 0 ; k-- ) {
          let subFound = true;

          for ( let l = 0 ; l < searchTokens.length ; l++ ) {
            let expect = true;
            let token  = searchTokens[l];

            if ( token.substr(0, 1) === '!' ) {
              expect = false;
              token  = token.substr(1);
            }

            if ( matches(subFields, token, subRows[k]) !== expect ) {
              subFound = false;

              break;
            }
          }

          if ( subFound ) {
            hits++;
          }
        }

        subMatches[row.get('id')] = hits;
      }

      if ( !mainFound && hits === 0 ) {
        out.removeAt(i);
      }
    }
  }

  return  {
    matches: out,
    subMatches
  };
}
