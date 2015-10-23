import Ember from 'ember';

export default Ember.Component.extend({
  editing: null,
  createLabel: 'Create',
  editLabel: 'Save',
  cancelLabel: 'Cancel',

  classNames: ['footer-actions'],
  saving: false,

  actions: {
    save() {
      // The save action must take a callback and call it when done (whether it succeded or not)
      // to update the state of the button.
      this.set('saving', true);
      this.sendAction('save', () =>  {
        this.set('saving', false);
      });
    },

    cancel() {
      this.sendAction('cancel');
    }
  },
});
