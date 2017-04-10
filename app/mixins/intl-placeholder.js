import Ember from 'ember';

export default Ember.Mixin.create({
  intl: Ember.inject.service(),

  attributeBindings: ['i18nPlaceholder:placeholder'],

  i18nPlaceholder: function() {
    return this.get('intl').t(this.get('placeholder'));
  }.property('placeholder','intl.locale'),
});
