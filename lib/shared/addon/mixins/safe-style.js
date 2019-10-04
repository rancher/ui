import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';

export default Mixin.create({
  safeStyle:  null,
  _safeStyle: computed('safeStyle', function() {
    if ( this.get('safeStyle') ) {
      return this.get('safeStyle').htmlSafe();
    } else {
      return ''.htmlSafe();
    }
  }),

  attributeBindings: ['_safeStyle:style'],
});
