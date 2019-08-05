import { later } from '@ember/runloop';
import Component from '@ember/component';
import layout from './template';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';

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
  savingColor:        'bg-primary',

  actions: {
    save() {
      // The save action must take a callback and call it when done (whether it succeded or not)
      // to update the state of the button.
      //
      setProperties(this, {
        saving: true,
        saved:  false,
      });

      if (this.save) {
        const cb = (success) =>  {
          if ( this.isDestroyed || this.isDestroying ) {
            return;
          }

          setProperties(this, {
            saving: false,
            saved:  ( success === true ),
          });
        };

        if ( typeof this.save === 'string' ) {
          this.sendAction('save', cb);
        } else {
          this.save(cb);
        }
      }
    },

    cancel() {
      if (this.cancel) {
        this.cancel();
      }
    },

    doNothing() {
    }
  },

  savedChanged: observer('saved', function() {
    if ( get(this, 'saved') ) {
      later(this, () => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        set(this, 'saved', false);
      }, 5000);
    }
  }),

  btnLabel: computed('saved', 'editing', 'savedLabel', 'editLabel', 'createLabel', function() {
    if ( get(this, 'saved') ) {
      return get(this, 'savedLabel');
    } else if ( get(this, 'editing') ) {
      return get(this, 'editLabel');
    } else {
      return get(this, 'createLabel');
    }
  }),
});
