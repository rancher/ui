export function initialize(/*container, application*/) {
  var body = $('BODY');
  if ('ontouchstart' in document.documentElement)
  {
    body.addClass('touch');
  }
  else
  {
    body.addClass('no-touch');
  }
}

export default {
  name: 'touch',
  initialize: initialize
};
