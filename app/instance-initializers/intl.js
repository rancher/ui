export function initialize(instance) {
  var intl = instance.lookup('service:intl');

  intl.reopen({
    tHtml(key, ...args) {
      const [ options ] = args;
      const translation = this.findTranslationByKey(key, options && options.locale);
      return this.formatHtmlMessage(translation, ...args);
    }
  });
}

export default {
  name: 'intl',
  after: 'ember-intl',
  initialize: initialize
};
