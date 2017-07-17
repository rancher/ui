import Ember from 'ember';

export default Ember.Component.extend({
  editing: null,
  createLabel: 'saveCancel.create',
  savingLabel: 'saveCancel.saving',
  editLabel: 'saveCancel.edit',
  cancelLabel: 'saveCancel.cancel',
  saveDisabled: false,
  cancelDisabled: false,
  savedLabel: 'saveCancel.saved',
  saveColor: 'bg-primary',
  savedColor: 'bg-success',
  cancelColor: 'bg-transparent',
  forFooter: true,
  classNames: ['text-center', 'pt-20', 'pb-20'],

  classNamesBindings: ['forFooter:footer-actions'],
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
  }.property('saved','editing','savedLabel','editLabel','createLabel'),

  savedChanged: function() {
    if ( this.get('saved') )
    {
      Ember.run.later(this, () => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.set('saved', false);
      }, 5000);
    }
  }.observes('saved'),
});
