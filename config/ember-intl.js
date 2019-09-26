/* eslint-env node */

// Override translation-reducer to not tell us about missing 'none' keys
// var TranslationReducer = require('ember-intl/lib/broccoli/translation-reducer');

// function propKeys(object) {
//   var result = [];
//   var escaped;

//   for (var key in object) {
//     escaped = key.replace(/\./g, '\\.');

//     if (object.hasOwnProperty(key)) {
//       if (typeof object[key] === 'object') {
//         result = result.concat(propKeys(object[key]).map(function (_key) {
//           return escaped + '.' + _key;
//         }));
//       } else {
//         result.push(escaped);
//       }
//     }
//   }

//   return result;
// }

// TranslationReducer.prototype.findMissingKeys = function(target, defaultTranslationKeys, locale) {
//   var targetProps = propKeys(target);
//   var log = this.options.log;

//   var total = defaultTranslationKeys.length;
//   var missing = {};

//   defaultTranslationKeys.forEach(function (property) {
//     if (targetProps.indexOf(property) === -1 && locale !== 'none') {
//       missing[locale] = (missing[locale]||0) + 1;
//       //log(property + '\' missing from ' + locale);
//     }
//   });

//   Object.keys(missing).forEach(function(locale) {
//     log(missing[locale] + ' keys missing in ' + locale);
//   });
// };

module.exports = function(/* environment */) {
  return {
    /**
     * The locales that the application needs to support.
     *
     * NOTE: this is optional and is automatically set *if* you store translations
     * within the `inputPath` defined below.
     *
     * If you side load translations, you must then explicitly
     * list out the locales. i.e: ['en-us', 'en-gb', 'fr-fr']
     *
     * @property locales
     * @type {Array?}
     * @default "null"
     */
    locales: ['en-us', 'de-de'],

    /**
     * Merges the fallback l=ocale's translations into all other locales as a
     * build-time fallback strategy.
     *
     * NOTE: a side effect of this option could result in missing translation warnings to be masked.
     *
     * @property fallbackLocale
     * @type {String?}
     * @default "null"
     */
    fallbackLocale: 'en-us',

    /**
     * Path where translations are kept.  This is relative to the project root.
     * For example, if your translations are an npm dependency, set this to:
     *`'./node_modules/path/to/translations'`
     *
     * @property inputPath
     * @type {String}
     * @default "'translations'"
     */
    inputPath: 'translations',

    /**
     * Automatically inject the Intl.JS polyfill into index.html
     *
     * @property autoPolyfill
     * @type {Boolean}
     * @default "false"
     */
    autoPolyfill: false,

    /**
     * Prevents the polyfill from being bundled in the asset folder of the build
     *
     * @property disablePolyfill
     * @type {Boolean}
     * @default "false"
     */
    disablePolyfill: false,

    /**
     * Prevents the translations from being bundled with the application code.
     * This enables asynchronously loading the translations for the active locale
     * by fetching them from the asset folder of the build.
     *
     * See: https://ember-intl.github.io/ember-intl/docs/guide/asynchronously-loading-translations
     *
     * @property publicOnly
     * @type {Boolean}
     * @default "false"
     */
    publicOnly: true,

    /**
     * Cause a build error if ICU argument mismatches are detected.
     *
     * @property errorOnNamedArgumentMismatch
     * @type {Boolean}
     * @default "false"
     */
    errorOnNamedArgumentMismatch: false,

    /**
     * Cause a build error if missing translations are detected.
     *
     * See https://ember-intl.github.io/ember-intl/docs/guide/missing-translations#throwing-a-build-error-on-missing-required-translation
     *
     * @property errorOnMissingTranslations
     * @type {Boolean}
     * @default "false"
     */
    errorOnMissingTranslations: false,

    /**
     * removes empty translations from the build output.
     *
     * @property stripEmptyTranslations
     * @type {Boolean}
     * @default false
     */
    stripEmptyTranslations: false,

    /**
     * Add the subdirectories of the translations as a namespace for all keys.
     *
     * @property wrapTranslationsWithNamespace
     * @type {Boolean}
     * @default false
     */
    wrapTranslationsWithNamespace: false,

    /**
     * Filter missing translations to ignore expected missing translations.
     *
     * See https://ember-intl.github.io/ember-intl/docs/guide/missing-translations#requiring-translations
     *
     * @property requiresTranslation
     * @type {Function}
     * @default "function(key,locale){return true}"
     */
    requiresTranslation(/* key, locale */) {
      return false;
    }
  };
};
