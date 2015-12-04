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

  if (!externalId) {
    return out;
  }

  var idx = externalId.indexOf(C.EXTERNALID.KIND_SEPARATOR);
  if (idx >= 0) {
    // New style kind://[group:]ido
    out.kind = externalId.substr(0, idx);

    var rest = externalId.substr(idx + C.EXTERNALID.KIND_SEPARATOR.length);
    idx = rest.indexOf(C.EXTERNALID.GROUP_SEPARATOR);
    out.id = rest;
    if (idx >= 0) {
      // With group kind://group/id
      out.group = rest.substr(0, idx);
    } else {
      // Without group kind://id
      if (out.kind === C.EXTERNALID.KIND_CATALOG) {
        // For catalog kinds, we have a default group
        out.group = C.EXTERNALID.CATALOG_DEFAULT_GROUP;
      }

    }
  } else {

    var dashedIdx = externalId.lastIndexOf('-');

    // Old style just an ID
    out.kind = C.EXTERNALID.KIND_CATALOG;
    // defaultgroup:extid:version
    out.id = `${C.EXTERNALID.CATALOG_DEFAULT_GROUP}:${externalId.substr(0, dashedIdx)}:${externalId.substr(dashedIdx + 1)}`;
    out.group = C.EXTERNALID.CATALOG_DEFAULT_GROUP;
  }

  return out;
}
