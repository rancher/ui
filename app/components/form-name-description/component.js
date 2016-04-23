import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  // You can either set model or name+description
  model: null,
  name: null,
  description: null,

  _name: '',
  _description: '',

  nameLabel: 'Name',
  namePlaceholder: 'Name',
  nameHelp: '',
  nameRequired: false,
  nameDisabled: false,

  descriptionLabel: 'Description',
  descriptionHelp: '',
  descriptionPlaceholder: 'Description',
  descriptionRequired: false,
  descriptionDisabled: false,

  nameChanged: function() {
   Ember.run.once(() => {
    let val = this.get('_name');
    if ( this.get('model') ) {
      this.set('model.name', val);
    } else {
      this.set('name', val);
    }
   });
  }.observes('_name'),

  descriptionChanged: function() {
   Ember.run.once(() => {
    let val = this.get('_description');
    if ( this.get('model') ) {
      this.set('model.description', val);
    } else {
      this.set('description', val);
    }
   });
  }.observes('_description'),

  didInsertElement() {
    Ember.run.next(() => {
      if ( this._state !== 'destroying' ) {
        this.$('INPUT')[0].focus();
      }
    });
  },
});
