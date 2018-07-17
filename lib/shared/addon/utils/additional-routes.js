var list = {};

/* Usage: In your Addon:
 *
 * import { addRoutes } from 'ui/utils/additional-routes';
 *
 * addRoutes(function() {
 *   this.route('hello');
 *   this.route('foo', function() {
 *     this.route('bar', function() {
 *       this.route('baz');
 *     });
 *   });
 * });
 *
 * addRoutes(function() {
 *   this.route('nested-inside');
 * }, 'authenticated.project');
 *
 * @param callback:  Standard Ember Routing DSL function, see Ember.Router.map
 * @param parentRouteName: link-to-style name of the existing route to add these routes to.
 */
export function addRoutes(callback, parentRouteName = 'application' ) {
  // console.log('addRoutes', callback, parentRouteName);
  if ( !callback ) {
    return;
  }

  if ( !list ) {
    throw new Error('Cannot addRoutes after Router.map() has already been called');
  }

  if ( !list[parentRouteName] ) {
    list[parentRouteName] = [];
  }

  list[parentRouteName].push(callback);
}


export function applyRoutes(name) {
  // console.log('applyRoutes', name);
  if ( !list ) {
    throw new Error('Cannot applyRoutes after Router.map() has already been called');
  }

  if ( list[name] ) {
    return function() {
      list[name].forEach(function(fn) {
        fn.apply(this);
      }, this);
    };
  }

  return null;
}

// Clear the route list once it's no longer needed, and prevent future calls to try to
// add more routes (which won't work anwyay, because Router.map() has already run.
export function clearRoutes() {
  // console.log('clearRoutes()');
  list = null;
}

// Monkey patch route() so that additional routes can be added by an addon
// Ember.RouterDSL.prototype._route = Ember.RouterDSL.prototype.route;
// Ember.RouterDSL.prototype.route = function( name, options, callback ) {
//   if (arguments.length === 1) {
//     options = {};
//   }
//   else if (arguments.length === 2 && typeof options === 'function') {
//     callback = options;
//     options = {};
//   }

//   var key = `${this.parent}.${name}`;

//   // Add all the standard routes to the aditional routes table
//   addRoutes(callback, key);

//   // Create a new DSL fn that contains both the stadnard and addon routes
//   let newCallback = applyRoutes(key);

//   // Call the original route() with the new DSL Fn
//   this._route(name, options, newCallback);
// };
// End: Monkey patch

export default {
  addRoutes,
  applyRoutes,
  clearRoutes
}
