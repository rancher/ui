import C from 'ui/utils/constants';

// Parses externalIds on services into 
// {
//  kind: what kind of id this is supposed to be
//  group: for catalog, what group it's in
//  id: the actual external id
export function parseExternalId(externalId) {
  if ( !externalId )
  {
    return null;
  }

  var idx = externalId.indexOf(C.EXTERNALID.KIND_SEPARATOR);

  var out = {
    kind: C.EXTERNALID.KIND_CATALOG,
    group: null,
    id: null,
  };

  if ( idx >= 0 )
  {
    out.kind = externalId.substr(0,idx);
    var rest = externalId.substr(idx + C.EXTERNALID.KIND_SEPARATOR.length);
    idx = rest.indexOf(C.EXTERNALID.GROUP_SEPARATOR);
    if ( idx >= 0 )
    {
      out.group = rest.substr(0,idx);
      out.id = rest.substr(idx + C.EXTERNALID.GROUP_SEPARATOR.length );
    }
    else
    {
      if ( out.kind === C.EXTERNALID.KIND_CATALOG )
      {
        out.group = C.EXTERNALID.CATALOG_DEFAULT_GROUP;
      }

      out.id = rest;
    }

    return out;
  }
}
