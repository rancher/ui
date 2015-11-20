import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  model: null,
  namePlaceholder: 'Name',
  nameDisabled: false,
  descriptionPlaceholder: 'Description',

  tagName: '',
});
