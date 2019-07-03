import Util from 'shared/utils/util';
import Semver from 'semver';

export function satisfies(version, range) {
  // Semver doesn't take padding zeros like 17.03.1
  range   = range.replace(/\.0+(\d+)/g, '.$1');
  version = version.replace(/\.0+(\d+)/g, '.$1');
  version = version.replace(/\-.*$/g, ''); // strip hyphen (prerelease in semver) because cloud providers dont use it as prerelease

  if ( !Semver.validRange(range) ) {
    console.error('Invalid semver range:', range);

    return false;
  }

  if ( !Semver.valid(version) ) {
    console.error('Invalid semver version:', version);

    return false;
  }

  return Semver.satisfies(version, range);
}

export function maxSatisfying(versions, range) {
  const versionsErrors = [];
  const nueVersions = [].concat(versions);

  let satisfiedVersion = null;

  // Semver doesn't take padding zeros like 17.03.1
  range   = range.replace(/\.0+(\d+)/g, '.$1');

  let coercedVersions = []
  let origin = []

  nueVersions.forEach( ( version, i, ary ) => {
    ary[i] = version.replace(/\.0+(\d+)/g, '.$1');
    ary[i] = version.replace(/\-.*$/g, ''); // strip hyphen (prerelease in semver) because cloud providers dont use it as prerelease

    if ( !Semver.valid(Semver.coerce(version)) ) {
      versionsErrors.pushObject(`Invalid semver version: ${ version }`);
    } else {
      coercedVersions.push(coerceVersion(version))
      origin.push(version)
    }
  });

  if ( !Semver.validRange(range) ) {
    console.error('Invalid semver range:', range);

    return false;
  }

  if ( versionsErrors.length > 0 ) {
    versionsErrors.forEach( (v) => console.log(v));

    return false;
  }

  satisfiedVersion = Semver.maxSatisfying(coercedVersions, range);

  if (satisfiedVersion) {
    return origin.find((v) => {
      return coerceVersion(v).includes(satisfiedVersion);
    });
  } else {
    return null;
  }
}

// @TODO replace with semver calls and verify compare works the same for -preX tags
export function parse(str) {
  str = `${ str }`;

  // Trim off leading 'v'
  if ( str.substr(0, 1).toLowerCase() === 'v' ) {
    str = str.substr(1);
  }

  let parts = str.split(/[.-]/);

  return parts;
}

function comparePart(in1, in2) {
  in1 = (`${ in1 }`).toLowerCase();
  in2 = (`${ in2 }`).toLowerCase();

  if ( Util.isNumeric(in1) && Util.isNumeric(in2) ) {
    let num1 = parseInt(in1, 10);
    let num2 = parseInt(in2, 10);

    if ( !isNaN(num1) && !isNaN(num2) ) {
      return num1 - num2;
    }
  }

  return in1.localeCompare(in2);
}

export function compare(in1, in2) {
  if ( !in1 ) {
    return 1;
  }

  if ( !in2 ) {
    return -1;
  }

  let p1 = parse(in1);
  let p2 = parse(in2);

  let minLen = Math.min(p1.length, p2.length);

  for ( let i = 0 ; i < minLen ; i++ ) {
    let res = comparePart(p1[i], p2[i]);

    if ( res !== 0 ) {
      return res;
    }
  }

  return p1.length - p2.length;
}

export function minorVersion(str) {
  let [major, minor] = parse(str);

  if ( !minor ) {
    return `v${ major }.0`;
  }

  return `v${  major  }.${  minor }`;
}

export function coerceVersion(version) {
  const out = Semver.coerce(version) || {}

  if (Semver.valid(out)) {
    return out.version
  }
}

export function isDevBuild(version) {
  if ( ['dev', 'master', 'head'].includes(version) || version.endsWith('-head') || version.match(/-rc\d+$/) ) {
    return true;
  }

  return false;
}
