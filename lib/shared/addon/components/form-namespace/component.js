import { observer, get } from '@ember/object';
import { next } from '@ember/runloop';
import { alias, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { resolve, reject } from 'rsvp';

const REUSE = 'reuse';
const CREATE = 'create';

export default Component.extend({
  layout,
  intl: service(),
  scope: service(),

  createLabel: 'formNamespace.label.create',
  reuseLabel: 'formNamespace.label.reuse',

  // Outputs
  namespace: null,
  errors: null,

  reuseNamespaceId: null,
  createNamespace: null,

  mode: REUSE,
  editing: true,
  required: true,
  isReuse: equal('mode', REUSE),
  hookName: 'saveNamespace',

  classNames: ['inline-form'],
  choices: alias('scope.currentProject.namespaces'),

  init() {
    this._super(...arguments);
    let all = this.get('choices');

    this.set('createNamespace', this.get('clusterStore').createRecord({
      type: 'namespace',
      name: '',
      projectId: get(this, 'scope.currentProject.id'),
    }));

    // TODO
    // Find a namespace
    if ( this.get('mode') === REUSE ) {
      let namespace = get(this,'namespace') ||          // Passed in
                      all.findBy('isDefault', true) ||  // The default one
                      all.objectAt(0);                  // Ok any one

      if ( namespace && namespace.id) {
        this.set('reuseNamespaceId', get(namespace, 'id'));
      } else if (namespace){
        this.set('createNamespace', namespace);
        this.set('mode', CREATE);
        return;
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

    this.sendAction('registerHook', this.saveNamespace.bind(this), {name: get(this,'hookName'), key: '_beforeSaveHooks'});
  },

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

  saveNamespace() {
    if (this.isDestroyed || this.isDestroying ) {
      return;
    }

    if ( get(this, 'isReuse') ) {
      return resolve();
    } else if ( get(this, 'errors.length') ) {
      return reject();
    }

    const namespace = get(this, 'namespace');
    return namespace.save().then((newNamespace) => {
      newNamespace.waitForState('active');
    });
  },
});
