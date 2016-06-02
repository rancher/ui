/*jshint node:true*/

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
