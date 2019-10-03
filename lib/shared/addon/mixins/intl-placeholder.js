import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';

export default Mixin.create({
  intl: service(),

  attributeBindings: ['i18nPlaceholder:placeholder'],

  i18nPlaceholder: computed('placeholder', 'intl.locale', function() {
    return this.get('intl').t(this.get('placeholder'));
  }),
});
