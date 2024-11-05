import { get } from '@ember/object';
import { isArray } from '@ember/array';

export function ucFirst(str) {
  str = str||'';
  return str.substr(0,1).toUpperCase() + str.substr(1);
}

export function camelToTitle(str) {
  return (str||'').dasherize().split('-').map((str) => { return ucFirst(str); }).join(' ');
}

export function displayKeyFor(type, key, intl) {
  let intlPrefix = `model.${type}.${key}`;

  if ( intl.exists(`${intlPrefix}.label`) ) {
    return intl.t(`${intlPrefix}.label`);
  }

  if ( intl.exists(intlPrefix) ) {
    return intl.t(intlPrefix);
  }

  if ( key.match(/.Id$/) ) {
    return camelToTitle(key.replace(/Id$/,''));
  }

  return camelToTitle(key);
}

export function validateLength(val, field, displayKey, intl, errors=[]) {
  let len = 0;
  if ( val ) {
    len = get(val, 'length');
  }

  if (
    !field.nullable &&
    field.required &&
    ( val === null ||
      (typeof val === 'string' && len === 0) ||
      (isArray(val) && len === 0)
    )
  ) {
    errors.push(intl.t('validation.required', {key: displayKey}));
    return errors;
  }

  if ( val === null ) {
    return errors;
  }

  let min, max;
  let lengthKey = (field.type.indexOf('array[') === 0 ? 'arrayLength' : 'stringLength');

  // String and array length:
  min = field.minLength;
  max = field.maxLength;
  if ( min && max ) {
    if ( (len < min) || (len > max) ) {
      if ( min === max ) {
        errors.push(intl.t(`validation.${lengthKey}.exactly`, {key: displayKey, count: min}));
      } else {
        errors.push(intl.t(`validation.${lengthKey}.between`, {key: displayKey, min: min, max: max}));
      }
    }
  } else if ( min && (len < min) ) {
    errors.push(intl.t(`validation.${lengthKey}.min`, {key: displayKey, count: min}));
  } else if ( max && (len > max) ) {
    errors.push(intl.t(`validation.${lengthKey}.max`, {key: displayKey, count: max}));
  }

  // Number min/max
  min = field.min;
  max = field.max;
  if ( val !== null && min && max ) {
    if ( (val < min) || (val > max) ) {
      if ( min === max ) {
        errors.push(intl.t('validation.number.exactly', {key: displayKey, val: max}));
      } else {
        errors.push(intl.t('validation.number.between', {key: displayKey, min: min, max: max}));
      }
    }
  } else if ( min && (val < min) ) {
    errors.push(intl.t('validation.number.min', {key: displayKey, val: min}));
  } else if ( max && (val > max) ) {
    errors.push(intl.t('validation.number.max', {key: displayKey, val: max}));
  }

  return errors;
}

export function validateChars(val, field, displayKey, intl, errors=[]) {
  const test = [];

  if ( field.validChars ) {
    test.push('[^'+ field.validChars + ']');
  }

  if ( field.invalidChars ) {
    test.push('['+ field.invalidChars + ']');
  }

  if ( test.length ) {
    var regex = new RegExp('('+ test.join('|') + ')','g');
    var match = val.match(regex);
    if ( match ) {
      match = match.uniq().map((chr) => {
        if ( chr === ' ' ) {
          return '[space]';
        } else {
          return chr;
        }
      });

      errors.push(intl.t('validation.chars', {key: displayKey, count: match.length, chars: match.join(' ')}));
    }
  }

  return errors;
}

export function validateHostname(val, displayKey, intl, opts, errors=[]) {
  opts = opts || {};

  const max = opts.max || 253;
  const restricted = opts.restricted || false;

  // Hostname can not start with a dot
  if (val.slice(0,1) ==='.'){
      errors.push(intl.t('validation.dns.hostname.startDot', {key: displayKey}));
  }

  // Hostname can not end with a dot in restricted mode
  if ( restricted && val.length > 1 && val.slice(-1) ==='.' ) {
    errors.push(intl.t('validation.dns.hostname.endDot', {key: displayKey}));
  }

  // Hostname can not be empty string
  if (val.length === 0){
      errors.push(intl.t('validation.dns.hostname.empty', {key: displayKey}));
  }

  // Total length of the hostname can be at most 253 characters
  // (255 minus one for null-termination, and one for the trailing dot of a real FQDN)
  if (val.length > max) {
      errors.push(intl.t('validation.dns.hostname.tooLong', {key: displayKey, max: max}));
  }

  // Split the hostname with the dot and validate the element as label
  let labels = val.split(/\./);
  let label;
  for ( let i = 0 ; i < labels.length ; i++ ) {
    label = labels[i];

    // Already checked if Hostname starts with a dot
    if ( i === 0 && label === "" ){
      continue;
    }

    // Hostname can end with a dot (this makes it an explicitly fully qualified domain name)
    // so the last element of the labels can be empty string.
    if (i === labels.length-1 && label === ""){
        continue;
    }

    validateDnsLabel(label, displayKey, intl, {forHostname: true}, errors);
  }

  return errors;
}

export function validateDnsLabel(label, displayKey, intl, opts, errors=[]) {
  opts = opts || {};

  const forHostname = opts.forHostname || false;
  const errorKey = (forHostname ? 'hostname' : 'label');
  const restricted = opts.restricted || false;

  // [a-z]([-a-z0-9]*[a-z0-9])?

  // Label must consist of a-z, 0-9 and hyphen
  validateChars(label, {validChars: 'A-Za-z0-9-'}, displayKey, intl, errors);

  // Restricted labels cannot begin with a number
  if ( restricted && label.slice(0,1).match(/[0-9]/) ) {
    errors.push(intl.t(`validation.dns.${errorKey}.startNumber`, {key: displayKey}));
  }

  // Label cannot begin with a hyphen
  if ( label.slice(0,1) === '-' ) {
    errors.push(intl.t(`validation.dns.${errorKey}.startHyphen`, {key: displayKey}));
  }

  // Label cannot end with a hyphen
  if ( label.slice(-1) === '-' ) {
    errors.push(intl.t(`validation.dns.${errorKey}.endHyphen`, {key: displayKey}));
  }

  // Label cannot contain two consecutive hyphens at the 3rd & 4th characters, unless an IDN string
  if ( label.substr(2,2) === '--' && label.substr(0,2) !== 'xn' ) {
    errors.push(intl.t(`validation.dns.doubleHyphen`, {key: displayKey}));
  }

  // Label must be 1-63 characters
  const min = 1;
  const max = 63;
  if ( label.length < min ) {
    errors.push(intl.t(`validation.dns.${errorKey}.emptyLabel`, {key: displayKey, min: min}));
  } else if  ( label.length > max ) {
    errors.push(intl.t(`validation.dns.${errorKey}.tooLongLabel`, {key: displayKey, max: max}));
  }

  return errors;
}
