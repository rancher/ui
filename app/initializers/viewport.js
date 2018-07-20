export function initialize() {
  if ( screen && (screen.width <= 570) ) {
    document.getElementById('viewport').setAttribute('content', 'width=570');
  }
}

export default {
  name:       'viewport',
  initialize
};
