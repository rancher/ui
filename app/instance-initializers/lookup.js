export function initialize(application) {
  // Shortcuts for debugging.  These should never be used in code.
  window.l = function(name) {
    return application.lookup(name);
  };

  window.lc = function(name) {
    return application.lookup(`controller:${ name }`);
  };

  window.ls = function(name) {
    return application.lookup(`service:${ name }`);
  };

  window.s  = application.lookup('service:store');
  window.cs = application.lookup('service:clusterStore');
  window.gs = application.lookup('service:globalStore');
}

export default {
  name:       'lookup',
  initialize,
};
