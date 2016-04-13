const list = [];

/* Usage: In your Addon:
 *
 * import { addRoutes } from 'ui/utils/additional-routes';
 * addRoutes(function() {
 *  this.route('hello');
 *  this.route('world');
 *  this.route('foo', function() {
 *    this.route('bar', function() {
 *      this.route('baz');
 *    });
 *  });
 * });
 */
export function addRoutes(r) {
  list.push(r);
}

export function applyRoutes(router) {
  list.forEach(function(fn) {
    fn.apply(router);
  });
}
