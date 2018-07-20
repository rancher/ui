export function initialize(/* application*/) {
  // Add 'touch' or 'no-touch' to the <body> so CSS can depend on the device type.

  var body = $('BODY'); // eslint-disable-line

  if ('ontouchstart' in document.documentElement) {
    // Has touch, like an iPad
    body.addClass('touch');
  } else {
    // Does not have touch, like a desktop
    body.addClass('no-touch');
  }
}

export default {
  name:       'touch',
  initialize
};
