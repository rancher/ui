export default function missingMessage(key, locale) {
  if ( key ) {
    locale = locale || 'unknown';
    if ( locale !== 'none' ) {
      console.warn(`Translation not found: locale='${ locale }', key='${ key }'.`);
    }

    return `*%${ key }%*`;
  } else {
    return '';
  }
}
