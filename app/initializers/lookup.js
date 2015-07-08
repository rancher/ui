export function initialize(/*container, application*/) {
  // Shortcuts for debugging.  These should never be used in code.
  window.l = function(name) {
    return Ui.__container__.lookup(name);
  };

  window.lc = function(name) {
    return Ui.__container__.lookup('controller:'+name);
  };

  window.s = Ui.__container__.lookup('store:main');
}

export default {
  name: 'lookup',
  initialize: initialize
};
