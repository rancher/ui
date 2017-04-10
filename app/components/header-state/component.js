import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['tag','inline-block'],
  classNameBindings: ['model.stateBackground'],
});
