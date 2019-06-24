export default function missingMessage(key, locales) {
  if ( key ) {
    locales = locales || ['unknown'];
    if ( locales[0] !== 'none' ) {
      console.warn(`Translation not found: locale='${ locales.join(', ') }', key='${ key }'.`);
    }

    return `*%${ key }%*`;
  } else {
    return '';
  }
}
