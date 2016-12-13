import Ember from 'ember';

// debouncedObserver('observeKey1','...','observerKeyN', function() {} [, delay] [,leadingEdge])
export function debouncedObserver(...args) {
  var argsLength = args.length;
  var funcIndex, keys, opt;

  if (typeof args[argsLength - 1] === 'function') {
    funcIndex = argsLength - 1;
  }
  else if (typeof args[argsLength - 2] === 'function') {
    funcIndex = argsLength - 2;
  }
  else if (typeof args[argsLength - 3] === 'function') {
    funcIndex = argsLength - 3;
  }
  else {
    throw Error('Invalid arguments');
  }

  opt = args.slice(funcIndex);
  keys = args.slice(0, funcIndex);

  var fn = function() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    opt[0].apply(this);
  };

  return Ember.observer.apply(Ember, keys.concat(function() {
    Ember.run.debounce(this, fn, opt[1] || 250, opt[2] || false);
  }));
}

export function throttledObserver(...args) {
  var argsLength = args.length;
  var funcIndex, keys, opt;

  if (typeof args[argsLength - 1] === 'function') {
    funcIndex = argsLength - 1;
  }
  else if (typeof args[argsLength - 2] === 'function') {
    funcIndex = argsLength - 2;
  }
  else if (typeof args[argsLength - 3] === 'function') {
    funcIndex = argsLength - 3;
  }
  else {
    throw Error('Invalid arguments');
  }

  opt = args.slice(funcIndex);
  keys = args.slice(0, funcIndex);

  return Ember.observer.apply(Ember, keys.concat(function() {
    Ember.run.throttle(this, opt[0], opt[1] || 250, opt[2] || false);
  }));
}
