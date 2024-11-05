export function normalizeType(type, store) {
  type = (type||'').toLowerCase();

  if ( type.startsWith('/') && store ) {
    const prefix = store.baseUrl+'/schemas/';
    if ( type.startsWith(prefix) ) {
      type = type.substr(prefix.length);
    }
  }

  return type;
}
