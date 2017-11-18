export function initialize(application) {
  // Shortcuts for debugging.  These should never be used in code.
  window.l = function(name) {
    return application.lookup(name);
  };

  window.lc = function(name) {
    return application.lookup('controller:'+name);
  };

  window.ls = function(name) {
    return application.lookup('service:'+name);
  };

  window.s  = application.lookup('service:store');
  window.us = application.lookup('service:user-store');
  window.cs = application.lookup('service:cluster-store');
  window.ns = application.lookup('service:authn-store');
  window.zs = application.lookup('service:authz-store');
}

export default {
  name: 'lookup',
  initialize: initialize,
};
