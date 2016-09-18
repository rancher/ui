
export function parse(str) {
  str = str+'';

  // Trim off leading 'v'
  if ( str.substr(0,1).toLowerCase() === 'v' )
  {
    str = str.substr(1);
  }

  let parts = str.split(/[.-]/);
  return parts;
}

function isNumeric(str) {
  return typeof str === 'string' && str.match(/^[0-9]*$/);
}

function comparePart(in1, in2) {
  in1 = (in1+"").toLowerCase();
  in2 = (in2+"").toLowerCase();

  if ( isNumeric(in1) && isNumeric(in2) )
  {
    let num1 = parseInt(in1,10);
    let num2 = parseInt(in2,10);

    if ( !isNaN(num1) && !isNaN(num2) )
    {
      return num1 - num2;
    }
  }

  return in1.localeCompare(in2);
}

export function compare(in1, in2) {
  let p1 = parse(in1);
  let p2 = parse(in2);

  let minLen = Math.min(p1.length, p2.length);
  for ( let i = 0 ; i < minLen ; i++ )
  {
    let res = comparePart(p1[i], p2[i]);
    if ( res !== 0 )
    {
      return res;
    }
  }

  return p1.length - p2.length;
}

export function minorVersion(str) {
  let [major, minor /*, patch, pre*/] = parse(str);
  if ( !minor )
  {
    return 'v'+ major +'.0';
  }

  return 'v' + major + '.' + minor;
}
