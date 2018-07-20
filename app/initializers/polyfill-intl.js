import { loadScript } from 'ui/utils/load-script';

export function initialize(application ) {
  if ( typeof Intl === 'undefined' ) {
    application.needIntlPolyfill = true;
    application.deferReadiness();
    loadScript(`${ application.baseAssets }assets/intl/intl.min.js`).then(() => loadScript(`${ application.baseAssets }assets/intl/locales/en-us.js`))
      .finally(() => {
        application.advanceReadiness();
      });
  }
}

export default {
  name:       'polyfill-intl',
  initialize,
  before:     'app',
};
