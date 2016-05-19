import Ember from 'ember';

export default Ember.Mixin.create({
  intl     : Ember.inject.service(),
  getTranslationTextOrFallback(key, msg) {
    let out = this.get('intl').findTranslationByKey(key);

    if (out) {
      out = this.get('intl').formatHtmlMessage(out);
    } else {
      out = msg;
    }

    return out;
  },
});
