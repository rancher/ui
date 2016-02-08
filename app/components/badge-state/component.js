import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'SPAN',
  classNames: ['state',],
  classNameBindings: ['model.stateColor'],
});
