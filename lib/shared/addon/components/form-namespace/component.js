import { observer, get } from '@ember/object';

import { next } from '@ember/runloop';
import { alias, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

const REUSE = 'reuse';
const CREATE = 'create';

export default Component.extend({
  layout,
  intl: service(),
  scope: service(),

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
  choices: alias('scope.currentProject.namespaces'),

  init() {
    this._super(...arguments);
    let all = this.get('choices');

    this.set('createNamespace', this.get('clusterStore').createRecord({
      type: 'namespace',
      name: '',
    }));

    // Find a namespace
    if ( this.get('mode') === REUSE ) {
      let namespace = get(this,'namespace') ||          // Passed in
                      all.findBy('isDefault', true) ||  // The default one
                      all.objectAt(0);                  // Ok any one

      if ( namespace ) {
        this.set('reuseNamespaceId', get(namespace, 'id'));
      } else {
        next(() => {
          this.set('mode', CREATE);
          this.get('createNamespace.name', 'default')
        });
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
