import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  model: null,
  showName: true,
  nameLabel: 'Name',
  namePlaceholder: 'Name',
  nameDisabled: false,
  showDescription: true,
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'Description',
  descriptionDisabled: false,

  tagName: '',
});
