import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  currentController: null,

  classNames: ['host','add-host'],
  click: function() {
    this.get('currentController').transitionToRoute('hosts.new');
  }
});
