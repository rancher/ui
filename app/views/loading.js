import Ember from "ember";

export default Ember.View.extend({
  classNames: ['loading-overlay'],

  animateIn: function(done) {
    $('#loading-underlay').show();
    var elem = this.$();
    if ( elem )
    {
      elem.fadeIn({duration: 200, queue: false, easing: 'linear', complete: done});
    }
  },

  animateOut: function(done) {
    $('#loading-underlay').hide();
    var elem = this.$();
    if ( elem )
    {
      elem.fadeOut({duration: 100, queue: false, easing: 'linear', complete: done});
    }
  },
});
