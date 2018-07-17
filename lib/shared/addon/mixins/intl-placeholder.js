import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  intl: service(),

  attributeBindings: ['i18nPlaceholder:placeholder'],

  i18nPlaceholder: function() {
    return this.get('intl').t(this.get('placeholder'));
  }.property('placeholder', 'intl.locale'),
});
