import { observer } from '@ember/object';
import { next } from '@ember/runloop';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

const REUSE = 'reuse';
const CREATE = 'create';

export default Component.extend({
  layout,
  intl: service(),

  // Outputs
  stack: null,
  errors: null,

  reuseStackId: null,
  createStack: null,

  mode: REUSE,
  editable: true,
  required: true,
  isReuse: equal('mode', REUSE),

  classNames: ['inline-form'],
  choices: null,

  init() {
    this._super(...arguments);
    let all = this.get('store').all('stack');
    this.set('choices', all);

    this.set('createStack', this.get('store').createRecord({
      type: 'stack',
      name: '',
    }));

    // Find the default stack if none is passed in
    if ( this.get('mode') === REUSE ) {
      if ( this.get('stack') ) {
        this.set('reuseStackId', this.get('stack.id'));
      } else {
        let stack = all.findBy('isDefault', true);
        if ( stack && stack.get('id') ) {
          this.set('reuseStackId', stack.get('id'));
        } else {
          next(() => {
            this.set('mode', CREATE);
            this.get('createStack.name', 'Default')
          });
        }
      }

      next(() => {
        this.updateStack();
      });
    }
  },

  updateStack: observer('reuseStackId','mode', function() {
    let stack;
    if ( this.get('mode') === REUSE ) {
      stack = this.get('choices').findBy('id', this.get('reuseStackId'));
    }

    if ( !stack ) {
      stack = this.get('createStack');
    }

    this.set('stack', stack);
  }),

  validate: observer('stack.{id,name}', function() {
    let intl = this.get('intl');
    let errors = [];

    let stack = this.get('stack');
    if ( stack && stack.get('name') ) {
      stack.validationErrors().forEach((err) => {
        errors.push(intl.t('formStack.errors.validation', {error: err}))
      });
    } else {
      errors.push(intl.t('validation.required', {key: intl.t('generic.stack')}));
    }

    if ( errors.length ) {
      this.set('errors', errors);
    } else {
      this.set('errors', null);
    }
  }),

  actions: {
    toggle() {
      let mode = (this.get('mode') === REUSE ? CREATE : REUSE);
      this.set('mode', mode);
      if ( mode === CREATE ) {
        next(() => {
          let elem = this.$('.new-name')[0];
          if ( elem ) {
            elem.focus();
            elem.select();
          }
        });
      }
    },
  },
});
