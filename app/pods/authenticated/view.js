import Ember from "ember";

//   Toggle position:relative on the main page container depending on the height of the content
var cur = null;
function relativeRelative() {
  var auth = $('.authenticated');
  var neu = ( auth.height() > $(window).height() ? 'relative' : 'static');

  if ( neu !== cur )
  {
    cur = neu;
    auth.css({position: cur});
  }
}

export default Ember.View.extend({
  classNames: ['authenticated'],
  classNameBindings: ['context.navExpand:nav-expand'],
  timer: null,

  didInsertElement: function() {
    this.set('timer', setInterval(relativeRelative, 250));
  },

  willDestoyElement: function() {
    clearInterval(this.get('timer'));
  }
});
