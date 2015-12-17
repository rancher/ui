import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['header-state','pull-right','section','r-mt5'],
  classNameBindings: ['model.stateColor'],
});
