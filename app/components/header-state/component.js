import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['pull-right','section','r-mt5'],
  classNameBindings: ['model.stateColor'],
});