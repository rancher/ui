import VolumeSpec from 'ui/models/volumespec';

// name:/incontainer:opt,opt2
// name:/incontainer
// /onhost:/incontainer:opt
// /onhost:/incontainer
// /incontainer
// @TODO support the windows clown-show (https://github.com/moby/moby/blob/master/volume/volume_windows.go)
export function parseVolumeSpec(str) {
  str = str.trim();

  let source='', dest='', opts='';

  let parts = str.split(':');
  switch ( parts.length ) {
    case 1:
      dest = parts[0];
      break;
    case 2:
      source = parts[0];
      dest = parts[1];
      break;
    case 3:
      source = parts[0];
      dest = parts[1];
      opts = parts[2];
      break;
    default:
      return null;
  }

  if ( !opts ) {
    opts = 'rw';
  }

  return VolumeSpec.create({
    source,
    dest,
    opts
  });
}

export function stringifyVolumeSpec(spec) {
  let source = (spec.source||'').trim();
  let dest = (spec.dest||'').trim();
  let opts = (spec.opts||'').trim();

  // RW is the default
  if ( opts === 'rw' ) {
    opts = '';
  }

  if ( opts ) {
    return source +':'+ dest +':'+ opts;
  } else if ( source ) {
    return source +':'+ dest;
  } else {
    return dest;
  }
}

export default {
  parseVolumeSpec,
  stringifyVolumeSpec,
};
