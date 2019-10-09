;(function(Ember, $) {
  var objectKeys = Object.keys || Ember.keys;

  var MODIFIERS = {
    '⇧': 16, shift: 16,
    '⌥': 18, alt: 18, option: 18,
    '⌃': 17, ctrl: 17, control: 17,
    '⌘': 91, command: 91
  };

  var DEFINITIONS = {
    backspace: 8, tab: 9, clear: 12,
    enter: 13, 'return': 13,
    esc: 27, escape: 27, space: 32,
    left: 37, up: 38,
    right: 39, down: 40,
    del: 46, 'delete': 46,
    home: 36, end: 35,
    pageup: 33, pagedown: 34,
    ',': 188, '.': 190, '/': 191,
    '`': 192, '-': 189, '=': 187,
    ';': 186, '\'': 222,
    '[': 219, ']': 221, '\\': 220
  };

  for (var n = 1; n < 20; n++) DEFINITIONS['f'+n] = 111 + n;

  function code(c) {
    return DEFINITIONS[c] || c.toUpperCase().charCodeAt(0);
  }

  var ENABLED = true;
  var PRESSED = {};
  var PRESSED_MODS = {};
  var SHORTCUTS = {};

  function normalize(kc) {
    switch (kc) {
      case 93: case 224: return 91; // Firefox does ⌘  weird
      case 61: return 187;          // and `=`
      case 173: return 189;         // and `-`
      default: return kc;
    }
  }

  function isMod(kc) {
    return kc === 16 || kc === 17 || kc === 18 || kc === 91;
  }

  function updatePressedMods(event, kc) {
    if (event.shiftKey) PRESSED_MODS[16] = true;
    if (event.ctrlKey)  PRESSED_MODS[17] = true;
    if (event.altKey)   PRESSED_MODS[18] = true;
    if (event.metaKey)  PRESSED_MODS[91] = true;
  }

  function forEach(array, fn) {
    for (var i = 0, len = array.length; i < len; i++) {
      fn(array[i]);
    }
  }

  function makeDispatch(router, filters) {
    function triggerShortcut(def, event) {
      var i, action, handler, infos;

      if (!(infos = router.currentRouteInfos)) return;

      for (i = infos.length - 1; i >= 0; i--) {
        handler = infos[i].route;

        if (handler.shortcuts && (action = handler.shortcuts[def.raw])) {
          handler.send(action, event);
          return;
        }
      }
    }

    function filter(event) {
      for (var i = 0; i < filters.length; i++) {
        if (!filters[i](event)) return false;
      }
      return true;
    }

    return function dispatchShortcut(event) {
      var kc = normalize(event.keyCode);

      PRESSED[kc] = true;

      if (isMod(kc)) {
        PRESSED_MODS[kc] = true;
        return;
      }

      updatePressedMods(event, kc);

      if (!ENABLED) return;
      if (!filter(event)) return;
      if (!(kc in SHORTCUTS)) return;

      forEach(SHORTCUTS[kc], function(def) {
        if (!modsMatch(def)) return;
        Ember.run(function() { triggerShortcut(def, event); });
      });
    };
  }

  function clear(event) {
    var kc = normalize(event.keyCode);
    if (PRESSED[kc]) PRESSED[kc] = undefined;
    if (PRESSED_MODS[kc]) PRESSED_MODS[kc] = undefined;
  }

  function reset() {
    PRESSED = {};
    PRESSED_MODS = {};
  }

  function modsMatch(def) {
    var mods = def.mods;
    return mods[16] === PRESSED_MODS[16] && mods[17] === PRESSED_MODS[17] &&
           mods[18] === PRESSED_MODS[18] && mods[91] === PRESSED_MODS[91];
  }

  function parse(spec) {
    var parts = spec.replace(/\s+/g, '').split('+');
    var kc = code(parts.pop());
    var m, mods = {};

    forEach(parts, function(part) {
      if ((m = MODIFIERS[part])) mods[m] = true;
    });

    return { mods: mods, kc: kc, raw: spec };
  }

  function register(shortcuts) {
    forEach(shortcuts, function(spec) {
      var def = parse(spec);
      if (!(def.kc in SHORTCUTS)) SHORTCUTS[def.kc] = [];
      SHORTCUTS[def.kc].push(def);
    });
  }

  var $doc = $(document);
  var $win = $(window);

  function targetIsNotInput(event) {
    var tagName = event.target.tagName;
    return (tagName !== 'INPUT') && (tagName !== 'SELECT') && (tagName !== 'TEXTAREA');
  }

  Ember.Shortcuts = Ember.Object.extend({
    concatenatedProperties: ['filters'],

    enable: function() { ENABLED = true; },
    disable: function() { ENABLED = false; },
    filters: [targetIsNotInput],

    init: function() {
      var router = this.get('router');
      var filters = this.get('filters');
      var dispatch = makeDispatch(router, filters);

      $doc.on('keydown.ember-shortcuts', dispatch);
      $doc.on('keyup.ember-shortcuts', clear);
      $win.on('focus.ember-shortcuts', reset);
      this.enable();

    },

    router: Ember.computed(function() {
      var path = 'router:main';
      return Ember.getOwner
        ? Ember.getOwner(this).lookup(path)._routerMicrolib
        : this.container.lookup(path)._routerMicrolib;
    }),

    unbind: function() {
      $doc.off('keydown.ember-shortcuts');
      $doc.off('keyup.ember-shortcuts');
      $win.off('focus.ember-shortcuts');
    },

    destroy: function() {
      SHORTCUTS = {};
      this.unbind();
    }
  });

  Ember.Route.reopen({
    mergedProperties: ['shortcuts'],
    registerShortcuts: function() {
      if (this.shortcuts) register(objectKeys(this.shortcuts));
    }.on('init')
  });

  Ember.onLoad('Ember.Application', function(Application) {
    Application.initializer({
      name: 'Ember Shortcuts',
      initialize: function() {
        var application = arguments[1] || arguments[0];
        application.register('shortcuts:main', Ember.Shortcuts);
        application.inject('route', 'shortcuts', 'shortcuts:main');
        application.inject('controller', 'shortcuts', 'shortcuts:main');
      }
    });
  });
}(Ember, $));
