import C from 'ui/utils/constants';

// Parses externalIds on services into
// {
//  kind: what kind of id this is supposed to be
//  group: for catalog, what group it's in
//  id: the actual external id
export function parseExternalId(externalId) {
  let CE = C.EXTERNAL_ID;

  var nameVersion;
  var out = {
    kind: null,
    group: null,
    id: null,
    name: null,
    version: null,
  };

  if (!externalId) {
    return out;
  }

  var idx = externalId.indexOf(CE.KIND_SEPARATOR);
  if (idx >= 0) {
    // New style kind://[group:]id
    out.kind = externalId.substr(0, idx);

    var rest = externalId.substr(idx + CE.KIND_SEPARATOR.length);
    idx = rest.indexOf(CE.GROUP_SEPARATOR);
    out.id = rest;
    if (idx >= 0) {
      // With group kind://group/id
      out.group = rest.substr(0, idx);
      nameVersion = rest.substr(idx+1);
    } else {
      // Without group kind://id
      if (out.kind === CE.KIND_CATALOG) {
        // For catalog kinds, we have a default group
        out.group = CE.CATALOG_DEFAULT_GROUP;
      }

      nameVersion = rest;
    }
  } else {

    var dashedIdx = externalId.lastIndexOf('-');

    // Old style just an ID
    out.kind = CE.KIND_CATALOG;
    let group = CE.CATALOG_DEFAULT_GROUP;
    let name = externalId.substr(0, dashedIdx);
    let version = externalId.substr(dashedIdx + 1);
    nameVersion = `${name}${CE.ID_SEPARATOR}${version}`;
    // defaultgroup:extid:version
    out.id = `${group}${CE.GROUP_SEPARATOR}${nameVersion}`;
    out.group = group;
  }

  if ( nameVersion ) {
    let parts = nameVersion.split(CE.ID_SEPARATOR);
    if ( parts && parts.length === 2 ) {
      out.name = parts[0];
      out.version = parts[1];
      out.templateId = `${out.group}${CE.GROUP_SEPARATOR}${out.name}`;
    }
  }

  return out;
}
