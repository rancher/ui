import C from 'ui/utils/constants';

export function parseCatalogSetting(str) {
  let out = {};

  str = (str || '').trim();
  if (!str) {
    return out;
  }

  str.split(',').forEach((item) => {
    let key, val;
    let idx = item.indexOf('=');
    if (idx > 0) {
      key = item.substr(0, idx);
      val = item.substr(idx + 1);
    } else {
      key = C.EXTERNALID.CATALOG_DEFAULT_GROUP;
      val = item;
    }

    key = key.trim();
    val = val.trim();
    if (key && val) {
      out[key] = val;
    }
  });

  return out;
}

