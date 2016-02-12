import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'SPAN',
  classNames: ['state', 'badge'],
  classNameBindings: ['model.stateColor', 'model.stateBackground'],
});
