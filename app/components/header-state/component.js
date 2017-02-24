import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['header-state','section'],
  classNameBindings: ['model.stateColor'],
});
