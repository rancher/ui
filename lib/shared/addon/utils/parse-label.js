import  { validateChars, validateHostname } from 'ember-api-store/utils/validate';

export function parseKey(str) {
  str = str || '';

  const idx = str.indexOf('/');

  if ( idx > 0 ) {
    const prefix = str.substr(0, idx);
    const key = str.substr(idx + 1);

    return {
      str,
      prefix,
      key
    }
  } else {
    return {
      str,
      prefix: null,
      key:    str,
    }
  }
}

const MIDDLE_ONLY = ['_', '.', '-'];

export function validateIdentifier(str, displayKey, intl, errors = []) {
  validateChars(str, { validChars: 'A-Za-z0-9_.-' }, displayKey, intl, errors);

  // Indentifier cannot begin with a hyphen
  let chr = str.slice(0, 1);

  if ( MIDDLE_ONLY.includes(chr) ) {
    errors.push(intl.t(`validation.k8s.identifier.startLetter`, { key: displayKey }));
  }

  // Label cannot end with a hyphen
  chr = str.slice(-1);
  if ( MIDDLE_ONLY.includes(chr) ) {
    errors.push(intl.t(`validation.k8s.identifier.endLetter`, { key: displayKey }));
  }

  // Label must be 1-63 characters
  const min = 1;
  const max = 63;

  if ( str.length < min ) {
    errors.push(intl.t(`validation.k8s.identifier.emptyKey`, {
      key: displayKey,
      min
    }));
  } else if  ( str.length > max ) {
    errors.push(intl.t(`validation.k8s.identifier}.tooLongKey`, {
      key: displayKey,
      max
    }));
  }
}

export function validatePrefix(str, displayKey, intl, errors = []) {
  const intlKey = intl.t('generic.key');
  const min = 1;
  const max = 253;

  if ( str.length < min ) {
    errors.push(intl.t(`validation.k8s.identifier.emptyPrefix`, {
      key: displayKey,
      min
    }));
  } else if  ( str.length > max ) {
    errors.push(intl.t(`validation.k8s.identifier}.tooLongPRefix`, {
      key: displayKey,
      max
    }));
  } else {
    validateHostname(str, intlKey, intl, { restricted: false }, errors);
  }
}

export function validateKey(str, intl, errors = []) {
  const parts = parseKey(str);
  const intlKey = intl.t('generic.key');

  if ( parts.prefix ) {
    validatePrefix(parts.prefix, intlKey, intl, errors);
  }

  validateIdentifier(parts.key, intlKey, intl, errors);
}

export function validateValue(str, intl, errors = []) {
  const intlKey = intl.t('generic.value');

  validateIdentifier(str, intlKey, intl, errors);
}
