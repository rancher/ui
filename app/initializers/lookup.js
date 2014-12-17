export function initialize(container/*, application*/) {
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
