import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'SPAN',
  classNames: ['badge-state','vertical-middle'],
  classNameBindings: ['model.stateBackground'],
});
