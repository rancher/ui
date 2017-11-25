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
  namespace: null,
  errors: null,

  reuseNamespaceId: null,
  createNamespace: null,

  mode: REUSE,
  editable: true,
  required: true,
  isReuse: equal('mode', REUSE),

  classNames: ['inline-form'],
  choices: null,

  init() {
    this._super(...arguments);
    let all = this.get('store').all('namespace');
    this.set('choices', all);

    this.set('createNamespace', this.get('store').createRecord({
      type: 'namespace',
      name: '',
    }));

    // Find the default namespace if none is passed in
    if ( this.get('mode') === REUSE ) {
      if ( this.get('namespace') ) {
        this.set('reuseNamespaceId', this.get('namespace.id'));
      } else {
        let namespace = all.findBy('isDefault', true);
        if ( namespace && namespace.get('id') ) {
          this.set('reuseNamespaceId', namespace.get('id'));
        } else {
          next(() => {
            this.set('mode', CREATE);
            this.get('createNamespace.name', 'default')
          });
        }
      }

      next(() => {
        this.updateNamespace();
      });
    }
  },

  updateNamespace: observer('reuseNamespaceId','mode', function() {
    let namespace;
    if ( this.get('mode') === REUSE ) {
      namespace = this.get('choices').findBy('id', this.get('reuseNamespaceId'));
    }

    if ( !namespace ) {
      namespace = this.get('createNamespace');
    }

    this.set('namespace', namespace);
  }),

  validate: observer('namespace.{id,name}', function() {
    let intl = this.get('intl');
    let errors = [];

    let namespace = this.get('namespace');
    if ( namespace && namespace.get('name') ) {
      namespace.validationErrors().forEach((err) => {
        errors.push(intl.t('formNamespace.errors.validation', {error: err}))
      });
    } else {
      errors.push(intl.t('validation.required', {key: intl.t('generic.namespace')}));
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
