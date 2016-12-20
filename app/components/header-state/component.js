import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['header-state','section','mt-5'],
  classNameBindings: ['model.stateColor'],
});
