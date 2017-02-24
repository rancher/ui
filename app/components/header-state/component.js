import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['header-state','btn'],
  classNameBindings: ['model.stateColor'],
});
