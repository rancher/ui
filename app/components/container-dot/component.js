import Ember from 'ember';

export default Ember.Component.extend({
  tooltipService: Ember.inject.service('tooltip'),
  model    : null,
  tagName  : 'span',
  type     : 'tooltip-action-menu',
  template : null,

  click(event) {
    this.details(event);
    this.get('tooltipService').hide();
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
