import Ember from 'ember';

export default Ember.Component.extend({

  model    : null,
  tagName  : 'span',
  type     : 'tooltip-action-menu',
  template : null,

  click(event) {
      this.details(event);
  },

  details(/*event*/) {
    var route = 'container';
    if ( this.get('model.isVm') )
    {
      route = 'virtualmachine';
    }

    this.get('router').transitionTo(route, this.get('model.id'));
  },
});
