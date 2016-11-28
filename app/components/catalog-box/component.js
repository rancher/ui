import Ember from 'ember';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  classNames: ['catalog-box'],
  classNameBindings: ['active::inactive'],

  model: null,
  showIcon: true,
  showSource: false,
  showDescription: true,
  active: true
});
