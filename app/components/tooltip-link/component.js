import Ember from 'ember';

export default Ember.Component.extend({
  tagName    : 'button',
  classNames : ['btn', 'btn-sm', 'btn-default'],
  icon       : null,
  text       : null,
  options    : null,

  click() {
    var options = this.get('options');

    this.get('router').transitionTo(options.route, {queryParams: options.options});
  },
});
