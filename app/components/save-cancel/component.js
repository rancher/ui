import Ember from 'ember';

export default Ember.Component.extend({
  editing: null,
  createLabel: 'Create',
  editLabel: 'Save',
  cancelLabel: 'Cancel',
  saveDisabled: false,
  cancelDisabled: false,
  savedLabel: 'Saved!',

  classNames: ['footer-actions'],
  saving: false,
  saved: false,

  actions: {
    save() {
      // The save action must take a callback and call it when done (whether it succeded or not)
      // to update the state of the button.
      //
      this.set('saving', true);
      this.set('saved', false);
      this.sendAction('save', (success) =>  {
        this.set('saving', false);
        this.set('saved', ( success === true ));
      });
    },

    cancel() {
      this.sendAction('cancel');
    }
  },

  btnLabel: function() {
    if ( this.get('saved') ) {
      return this.get('savedLabel');
    } else if ( this.get('editing') ) {
      return this.get('editLabel');
    } else {
      return this.get('createLabel');
    }
  }.property('saved','editing'),

  savedChanged: function() {
    if ( this.get('saved') )
    {
      Ember.run.later(this, () => {
        if ( this._state !== 'destroying' )
        {
          this.set('saved', false);
        }
      }, 5000);
    }
  }.observes('saved'),
});
