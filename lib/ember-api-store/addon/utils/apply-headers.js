import { get } from '@ember/object';

// Copy the headers from `more` into the object `dest`
// including ones with a value of undefined, so they
// can be removed later by someone calling applyHeaders.
export function copyHeaders(more, dest) {
  if ( !more || typeof more !== 'object' )
  {
    return;
  }

  Object.keys(more).forEach(function(key) {
    var val = get(more, key);
    var normalizedKey = key.toLowerCase();
    dest[normalizedKey] = val;
  });
}

// Apply the headers from `more` into the object `dest`
export function applyHeaders(more, dest, copyUndefined) {
  if ( !more || typeof more !== 'object' )
  {
    return;
  }

  Object.keys(more).forEach(function(key) {
    var val = get(more, key);
    var normalizedKey = key.toLowerCase();
    if ( val === undefined && copyUndefined !== true )
    {
      delete dest[normalizedKey];
    }
    else
    {
      dest[normalizedKey] = val;
    }
  });
}
