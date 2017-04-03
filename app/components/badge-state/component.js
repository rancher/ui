import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'SPAN',
  classNames: ['badge-state','inline-block'],
  classNameBindings: ['model.stateBackground'],
});
