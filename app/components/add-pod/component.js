import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  currentController: null,
  label: 'Add',
  route: null,

  classNames: ['pod','add-pod'],
  click: function() {
    var route = this.get('route');
    if ( route )
    {
      this.get('currentController').transitionToRoute(route);
    }
    else
    {
      console.error('No route set for add-pod component');
    }
  }
});
