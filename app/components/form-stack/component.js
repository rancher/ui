import Ember from 'ember';

const REUSE = 'reuse';
const CREATE = 'create';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  // Outputs
  stack: null,
  errors: null,

  reuseStackId: null,
  createStack: null,

  defaultName: 'Default',
  showAdvanced: false,
  mode: REUSE,
  isReuse: Ember.computed.equal('mode', REUSE),

  classNames: ['inline-form'],
  choices: null,

  init() {
    window.x = this;
    this._super(...arguments);
    let all = this.get('store').all('stack');
    this.set('choices', all);

    this.set('createStack', this.get('store').createRecord({
      type: 'stack',
      name: '',
    }));

    // Find the default stack if none is passed in
    if ( this.get('mode') === REUSE && !this.get('stack') ) {
      let stack = all.findBy('name', this.get('defaultName'))
      if ( stack ) {
        this.set('reuseStackId', stack.get('id'));
        Ember.run.next(() => {
          this.updateStack();
        });
      } else {
        Ember.run.next(() => {
          this.set('mode', CREATE);
          this.set('showAdvanced', true);
        });
      }
    }
  },

  updateStack: Ember.observer('reuseStackId','mode', function() {
    if ( this.get('mode') === REUSE ) {
      let stack = this.get('choices').findBy('id', this.get('reuseStackId'));
      this.set('stack', stack);
    } else {
      this.set('stack', this.get('createStack'));
    }
  }),

  validate: Ember.observer('stack.{id,name}', function() {
    let intl = this.get('intl');
    let errors = [];

    let stack = this.get('stack');
    if ( stack ) {
      stack.validationErrors().forEach((err) => {
        errors.push(intl.t('formStack.errors.validation', {error: err}))
      });
    } else {
      errors.push(intl.t('formStack.errors.noneChosen'));
    }

    if ( errors.length ) {
      this.set('errors', errors);
    } else {
      this.set('errors', null);
    }
  }),

  actions: {
    toggle() {
      this.set('mode', (this.get('mode') === REUSE ? CREATE : REUSE));
    },

    showAdvanced() {
      this.set('showAdvanced', true);
    },
  },
});
