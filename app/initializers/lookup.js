export function initialize(/*application*/) {
  // Shortcuts for debugging.  These should never be used in code.
  window.l = function(name) {
    return Ui.__container__.lookup(name);
  };

  window.lc = function(name) {
    return Ui.__container__.lookup('controller:'+name);
  };

  window.s = Ui.__container__.lookup('store:main');
  window.us = Ui.__container__.lookup('store:user');
}

export default {
  name: 'lookup',
  initialize: initialize,
  after: 'user-store',
};
