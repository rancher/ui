const list = {};

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
 * }, 'authenticated.project'); 
 *
 * @param r: anonymous function @see Ember.Router.map for more details
 * @param entrypoint: name of an existing routing level equivalent to the linkto helper. default to 'application'
 */

export function addRoutes( r, entrypoint='application' ) {
  if( ! r ) return;
  list[ entrypoint ] = list[ entrypoint ] || [];
  list[ entrypoint ].push( r );
}


export function applyRoutes( entrypoint ) {

  if( list[ entrypoint ] )
  {
    return function(){
      list[ entrypoint ].forEach( function(fn) {
        fn.apply( this );
      }, this);
    };
  }
  // else
  return null;

}
