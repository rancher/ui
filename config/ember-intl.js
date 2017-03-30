// Override translation-reducer to not tell us about missing 'none' keys
var TranslationReducer = require('ember-intl/lib/broccoli/translation-reducer');

function propKeys(object) {
  var result = [];
  var escaped;

  for (var key in object) {
    escaped = key.replace(/\./g, '\\.');

    if (object.hasOwnProperty(key)) {
      if (typeof object[key] === 'object') {
        result = result.concat(propKeys(object[key]).map(function (_key) {
          return escaped + '.' + _key;
        }));
      } else {
        result.push(escaped);
      }
    }
  }

  return result;
}

TranslationReducer.prototype.findMissingKeys = function(target, defaultTranslationKeys, locale) {
  var targetProps = propKeys(target);
  var log = this.options.log;

  var total = defaultTranslationKeys.length;
  var missing = {};

  defaultTranslationKeys.forEach(function (property) {
    if (targetProps.indexOf(property) === -1 && locale !== 'none') {
      missing[locale] = (missing[locale]||0) + 1;
      //log(property + '\' missing from ' + locale);
    }
  });

  Object.keys(missing).forEach(function(locale) {
    log(missing[locale] + ' keys missing in ' + locale);
  });
};

module.exports = function(environment) {
  return {
    locales: ['en-us'],
    baseLocale: 'en-us',
    disablePolyfill: false,
    publicOnly: true,
    inputPath: 'translations',
    outputPath: 'translations'
  };
};
