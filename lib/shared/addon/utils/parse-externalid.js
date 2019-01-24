import C from 'shared/utils/constants';

// Parses externalIds on services into
// {
//  kind: what kind of id this is supposed to be
//  group: for catalog, what group it's in
//  id: the actual external id
export function parseExternalId(externalId) {
  let CE = C.EXTERNAL_ID;

  var nameVersion;
  var out = {
    kind:    null,
    group:   null,
    base:    null,
    id:      null,
    name:    null,
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
      nameVersion = rest.substr(idx + 1);
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

    nameVersion = `${ name }${ CE.ID_SEPARATOR }${ version }`;
    // defaultgroup:extid:version
    out.id = `${ group }${ CE.GROUP_SEPARATOR }${ nameVersion }`;
    out.group = group;
  }

  if ( nameVersion ) {
    idx = nameVersion.lastIndexOf(CE.ID_SEPARATOR);
    let nameBase;

    if ( idx > 0 ) {
      out.version = nameVersion.substr(idx + 1);
      nameBase = nameVersion.substr(0, idx);
    } else {
      nameBase = nameVersion;
    }

    out.templateId = `${ out.group }${ CE.GROUP_SEPARATOR }${ nameBase }`;

    idx = nameBase.lastIndexOf(CE.BASE_SEPARATOR);
    if ( idx > 0 ) {
      out.base = nameBase.substr(0, idx);
      out.name = nameBase.substr(idx + 1);
    } else {
      out.name = nameBase;
    }
  }

  return out;
}

export function parseHelmExternalId(externalId) {
  let CE = C.EXTERNAL_ID;
  var out = {
    kind:    null,
    group:   null,
    base:    null,
    id:      null,
    name:    null,
    version: null,
  };

  if (!externalId) {
    return out;
  }

  var idx = externalId.indexOf(CE.KIND_SEPARATOR);

  // not very smart but maybe doesn't need to be?
  if (idx >= 0) {
    out.kind = externalId.substr(0, idx);

    var rest = externalId.substr(idx + CE.KIND_SEPARATOR.length + 1);

    out.id = externalId;
    rest = rest.split('&');
    rest.forEach((it) => {
      let [nm, vl] =  it.split('=');

      out[nm] = vl;
    });
  }

  let catalog = out.catalog

  if ( catalog.indexOf('/') !== -1 ) {
    catalog = catalog.replace('/', ':');
  } else {
    catalog = `cattle-global-data:${ catalog }`;
  }

  out.templateId = `${ catalog }-${ out.template }`;
  out.templateVersionId = `${ catalog }-${ out.template }-${ out.version }`;

  return out;
}
