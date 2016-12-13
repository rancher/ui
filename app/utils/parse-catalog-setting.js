import C from 'ui/utils/constants';

// New JSON format: {"catalogs": {"foo": {"url":"...", "branch": "master"}, ...}} 
export function parseCatalogSetting(str) {
  let out = {
    catalogs: {}
  };

  str = (str || '').trim();
  if (!str) {
    return out;
  }

  if ( str.substr(0,1) === '{' ) {
    // New JSON format
    try {
      let json = JSON.parse(str);
      if ( json && json.catalogs )
      {
        Object.keys(json.catalogs).forEach(function(k) {
          let entry = json.catalogs[k];
          if ( !entry.branch ) {
            entry.branch = C.CATALOG.DEFAULT_BRANCH;
          }
        });

        return json;
      }
    } catch (e) {}

    // If parsing fails, return empty object
    return out;
  }

  // Old string format
  str.split(',').forEach((item) => {
    let key, val;
    let idx = item.indexOf('=');
    if (idx > 0) {
      //Less old key=val,key2=val2 format
      key = item.substr(0, idx);
      val = item.substr(idx + 1);
    } else {
      // Even older single URL format
      key = C.EXTERNAL_ID.CATALOG_DEFAULT_GROUP;
      val = item;
    }

    key = key.trim();
    val = val.trim();
    if (key && val) {
      out.catalogs[key] = {url: val, branch: C.CATALOG.DEFAULT_BRANCH};
    }
  });

  return out;
}

export function getCatalogNames(str) {
  return Object.keys(parseCatalogSetting(str).catalogs).sort();
}
