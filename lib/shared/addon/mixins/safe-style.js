import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Mixin.create({
  safeStyle:  null,
  _safeStyle: computed('safeStyle', function() {
    if ( this.get('safeStyle') ) {
      return htmlSafe(this.get('safeStyle'));
    } else {
      return htmlSafe('');
    }
  }),

  attributeBindings: ['_safeStyle:style'],
});
