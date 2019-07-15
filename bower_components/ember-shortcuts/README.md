# Ember Shortcuts

## Inspiration

[keymaster](https://github.com/madrobby/keymaster). This library could not
exists without it, and is, in fact, an adaptation of it that integrates cleanly
with Ember.

## Installation

Get the code:

    bower install ember-shortcuts

Include it on your page somewhere after `ember.js`.

## Usage

In any route:

```
Ember.Route.Extend({
  shortcuts: {
    'shift+a': 'someAction'
  },

  actions: {
    someAction: function() {
      console.log('someAction');
    }
  }
});
```

Like `actions`, `shortcuts` get dispatch bottom-up through the currently active
routes.

Unlike `actions`, the `shortcut` handling does not bubble. In the example
above, if a child of that route defined a `shift+a: 'otherAction'` handler and
was active when the shortcut was pressed, the action `otherAction` would get
sent instead of `someAction`.

## Injection

Ember.Shortcuts, once includes, is available to you as an injected singleton on
your controllers and routes as the `shortcuts` property.

**`this.shortcuts.disable`**
**`this.shortcuts.enable`**

Call this to toggle whether or not the global keyboard shortcut handlers will
fire.

