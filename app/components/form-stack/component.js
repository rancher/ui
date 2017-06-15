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
      if ( stack  && stack.get('id') ) {
        this.set('reuseStackId', stack.get('id'));
      } else {
        Ember.run.next(() => {
          this.set('mode', CREATE);
          this.set('showAdvanced', true);
        });
      }

      Ember.run.next(() => {
        this.updateStack();
      });
    }
  },
  willDestroy(){
    this.setProperties({
      stack: null,
      errors: null,
      reuseStackId: null,
      createStack: null,
      showAdvanced: false,
      choices: null,
    });
  },

  updateStack: Ember.observer('reuseStackId','mode', function() {
    let stack;
    if ( this.get('mode') === REUSE ) {
      stack = this.get('choices').findBy('id', this.get('reuseStackId'));
    }

    if ( !stack ) {
      stack = this.get('createStack');
    }

    this.set('stack', stack);
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
      let mode = (this.get('mode') === REUSE ? CREATE : REUSE);
      this.set('mode', mode);
      if ( mode === CREATE ) {
        Ember.run.next(() => {
          let elem = this.$('.new-name')[0];
          if ( elem ) {
            elem.focus();
            elem.select();
          }
        });
      }
    },

    showAdvanced() {
      this.set('showAdvanced', true);
    },
  },
});
