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
          if ( !entry.kind ) {
            entry.kind = 'native';
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
      out.catalogs[key] = {url: val, kind: 'native', branch: C.CATALOG.DEFAULT_BRANCH};
    }
  });

  return out;
}

export function getCatalogNames(str) {
  return Object.keys(parseCatalogSetting(str).catalogs).sort();
}


export function getCatalogSubtree(str, projId) {
  let repos = getCatalogNames(str);
  let showAll = repos.length > 1;

  let out = [];
  if ( showAll ) {
    out.push({
      id: 'catalog-all',
      localizedLabel: 'nav.catalog.all',
      icon: 'icon icon-globe',
      route: 'catalog-tab',
      ctx: [projId],
      queryParams: {catalogId: 'all'}
    });

    // out.push({divider: true});
  }

  if (repos.indexOf(C.CATALOG.LIBRARY_KEY) >= 0 ) {
    repos.removeObject(C.CATALOG.LIBRARY_KEY);
    out.push({
      id: 'catalog-library',
      localizedLabel: 'nav.catalog.library',
      icon: 'icon icon-catalog',
      route: 'catalog-tab',
      ctx: [projId],
      queryParams: {catalogId: 'library'}
    });
  }

  if (repos.indexOf(C.CATALOG.COMMUNITY_KEY) >= 0 ) {
    repos.removeObject(C.CATALOG.COMMUNITY_KEY);
    out.push({
      id: 'catalog-community',
      localizedLabel: 'nav.catalog.community',
      icon: 'icon icon-users',
      route: 'catalog-tab',
      ctx: [projId],
      queryParams: {catalogId: 'community'}
    });
  }

  // if ( out.length > 2 ) {
  //   out.push({divider: true});
  // }

  repos.forEach((repo) => {
    out.push({
      id: 'catalog-'+repo,
      label: repo,
      icon: 'icon icon-user',
      route: 'catalog-tab',
      ctx: [projId],
      queryParams: {catalogId: repo}
    });
  });


  if ( out.length === 1 ) {
    return [];
  } else {
    return out;
  }
}
