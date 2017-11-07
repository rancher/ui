import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  rating: null,
  parseRating: computed('rating', function() {
    var safeCount = Math.round( parseInt(this.get('rating'), 10) );
    var out = [];
    for (var i = 0 ; i < safeCount ; i++){
      out.push(i);
    }
    return out;
  } )
});
