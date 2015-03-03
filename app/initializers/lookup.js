export function initialize(container/*, application*/) {
  // Shortcuts for debugging.  These should never be used in code.
  window.l = function(name) {
    return container.lookup(name);
  };

  window.lc = function(name) {
    return container.lookup('controller:'+name);
  };

  window.s = container.lookup('store:main');
}

export default {
  name: 'lookup',
  initialize: initialize
};
