import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['header-state','section','r-mt5'],
  classNameBindings: ['model.stateColor'],
});
