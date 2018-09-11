import { later } from '@ember/runloop';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  classNames:         ['text-center', 'pt-20'],
  classNamesBindings: ['forFooter: footer-actions'],

  cancelColor:        'bg-transparent',
  cancelDisabled:     false,
  cancelLabel:        'saveCancel.cancel',
  createLabel:        'saveCancel.create',
  editLabel:          'saveCancel.edit',
  editing:            null,
  forFooter:          true,
  saveColor:          'bg-primary',
  saveDisabled:       false,
  saved:              false,
  savedColor:         'bg-success',
  savedLabel:         'saveCancel.saved',
  saving:             false,
  savingLabel:        'saveCancel.saving',

  actions: {
    save() {
      // The save action must take a callback and call it when done (whether it succeded or not)
      // to update the state of the button.
      //
      this.set('saving', true);
      this.set('saved', false);
      this.sendAction('save', (success) =>  {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.set('saving', false);
        this.set('saved', ( success === true ));
      });
    },

    cancel() {
      this.sendAction('cancel');
    },

    doNothing() {
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
  }.property('saved', 'editing', 'savedLabel', 'editLabel', 'createLabel'),

  savedChanged: function() {
    if ( this.get('saved') ) {
      later(this, () => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.set('saved', false);
      }, 5000);
    }
  }.observes('saved'),
});
