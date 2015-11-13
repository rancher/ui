import C from 'ui/utils/constants';

// Parses externalIds on services into 
// {
//  kind: what kind of id this is supposed to be
//  group: for catalog, what group it's in
//  id: the actual external id
export function parseExternalId(externalId) {
  var out = {
    kind: null,
    group: null,
    id: null,
  };

  if ( !externalId )
  {
    return out;
  }

  var idx = externalId.indexOf(C.EXTERNALID.KIND_SEPARATOR);
  if ( idx >= 0 )
  {
    // New style kind://[group/]id
    out.kind = externalId.substr(0,idx);

    var rest = externalId.substr(idx + C.EXTERNALID.KIND_SEPARATOR.length);
    idx = rest.indexOf(C.EXTERNALID.GROUP_SEPARATOR);
    if ( idx >= 0 )
    {
      // With group kind://group/id
      out.group = rest.substr(0,idx);
      out.id = rest.substr(idx + C.EXTERNALID.GROUP_SEPARATOR.length );
    }
    else
    {
      // Without group kind://id
      if ( out.kind === C.EXTERNALID.KIND_CATALOG )
      {
        // For catalog kinds, we have a default group
        out.group = C.EXTERNALID.CATALOG_DEFAULT_GROUP;
      }

      out.id = rest;
    }
  }
  else
  {
    // Old style just an ID
    out.kind = C.EXTERNALID.KIND_CATALOG;
    out.id = externalId;
    out.group = C.EXTERNALID.CATALOG_DEFAULT_GROUP;
  }

  return out;
}
