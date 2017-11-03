import Ember from 'ember';

export default Ember.Component.extend({
  rating: null,
  parseRating: Ember.computed('rating', function() {
    var safeCount = Math.round( parseInt(this.get('rating'), 10) );
    var out = [];
    for (var i = 0 ; i < safeCount ; i++){
      out.push(i);
    }
    return out;
  } )
});
