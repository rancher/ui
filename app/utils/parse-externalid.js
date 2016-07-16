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

  var idx = externalId.indexOf(C.EXTERNAL_ID.KIND_SEPARATOR);
  if (idx >= 0) {
    // New style kind://[group:]ido
    out.kind = externalId.substr(0, idx);

    var rest = externalId.substr(idx + C.EXTERNAL_ID.KIND_SEPARATOR.length);
    idx = rest.indexOf(C.EXTERNAL_ID.GROUP_SEPARATOR);
    out.id = rest;
    if (idx >= 0) {
      // With group kind://group/id
      out.group = rest.substr(0, idx);
    } else {
      // Without group kind://id
      if (out.kind === C.EXTERNAL_ID.KIND_CATALOG) {
        // For catalog kinds, we have a default group
        out.group = C.EXTERNAL_ID.CATALOG_DEFAULT_GROUP;
      }

    }
  } else {

    var dashedIdx = externalId.lastIndexOf('-');

    // Old style just an ID
    out.kind = C.EXTERNAL_ID.KIND_CATALOG;
    // defaultgroup:extid:version
    out.id = `${C.EXTERNAL_ID.CATALOG_DEFAULT_GROUP}:${externalId.substr(0, dashedIdx)}:${externalId.substr(dashedIdx + 1)}`;
    out.group = C.EXTERNAL_ID.CATALOG_DEFAULT_GROUP;
  }

  return out;
}
