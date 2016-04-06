import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  model: null,
  nameLabel: 'Name',
  namePlaceholder: 'Name',
  nameRequired: false,
  nameDisabled: false,
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'Description',
  descriptionDisabled: false,

  didInsertElement() {
    Ember.run.next(() => {
      if ( this._state !== 'destroying' ) {
        this.$('INPUT')[0].focus();
      }
    });
  },
});
