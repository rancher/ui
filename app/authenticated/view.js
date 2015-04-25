import Ember from "ember";

//   Toggle position:relative on the main page container depending on the height of the content
var pos = null;
var mainHeight = null;
function relativeRelative() {
  var auth = $('.authenticated');
  var winHeight = $(window).height();
  var neu = ( auth.height() > winHeight ? 'relative' : 'static');

  if ( neu !== pos )
  {
    pos = neu;
    auth.css({position: pos});
  }

  var fullHeight = $('BODY').hasClass('white') | $('BODY').hasClass('full-height');
  var main = $('MAIN');
  var height = null;
  if ( fullHeight )
  {
    height = winHeight - main.position().top - parseInt(main.css('margin-top'),10) - parseInt(main.css('margin-bottom'),10);
  }

  if ( height !== mainHeight )
  {
    mainHeight = height;
    main.css('min-height', height);
  }
}

export default Ember.View.extend({
  classNames: ['authenticated'],
  timer: null,

  didInsertElement: function() {
    this.set('timer', setInterval(relativeRelative, 250));
  },

  willDestoyElement: function() {
    clearInterval(this.get('timer'));
  }
});
