import { observer, get, set } from '@ember/object';
import { next } from '@ember/runloop';
import {  equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { resolve, reject } from 'rsvp';
import $ from 'jquery';

const REUSE = 'reuse';
const CREATE = 'create';

export default Component.extend({
  intl:         service(),
  scope:        service(),
  clusterStore: service(),

  layout,
  createLabel: 'formNamespace.label.create',
  reuseLabel:  'formNamespace.label.reuse',

  // Outputs
  namespace: null,
  errors:    null,

  reuseNamespaceId: null,
  createNamespace:  null,

  mode:        REUSE,
  editing:     true,
  required:    true,
  allowCreate: true,
  hookName:    'saveNamespace',

  classNames: ['inline-form'],
  choices:    null,

  isReuse:         equal('mode', REUSE),
  init() {
    this._super(...arguments);

    if (this.registerHook) {
      this.registerHook(this.saveNamespace.bind(this), {
        name: get(this, 'hookName'),
        key:  '_beforeSaveHooks'
      });
    }

    const currentProjectsNamespaces = get(this, 'clusterStore').all('namespace').filterBy('projectId', get(this, 'scope.currentProject.id'));

    set(this, 'choices', currentProjectsNamespaces).sortBy('displayName');

    let all = get(this, 'choices');

    set(this, 'createNamespace', get(this, 'clusterStore').createRecord({
      type:                          'namespace',
      name:                          '',
      projectId:                     get(this, 'scope.currentProject.id'),
      containerDefaultResourceLimit: get(this, 'scope.currentProject.containerDefaultResourceLimit'),
    }));

    if ( get(this, 'mode') === REUSE ) {
      let namespace = get(this, 'namespace') ||          // Passed in
                      all.findBy('isDefault', true) ||  // The default one
                      all.objectAt(0);                  // Ok any one

      if ( namespace && namespace.id) {
        set(this, 'reuseNamespaceId', get(namespace, 'id'));
      } else if (namespace){
        set(this, 'createNamespace', namespace);
        set(this, 'mode', CREATE);

        return;
      } else {
        next(() => {
          set(this, 'mode', CREATE);
        });
      }

      next(() => {
        this.updateNamespace();
      });
    }
  },

  actions: {
    toggle() {
      let mode = (get(this, 'mode') === REUSE ? CREATE : REUSE);

      set(this, 'mode', mode);
      if ( mode === CREATE ) {
        next(() => {
          let elem = $('.new-name')[0];

          if ( elem ) {
            elem.focus();
            elem.select();
          }
        });
      }
    },
  },

  updateNamespace: observer('reuseNamespaceId', 'mode', function() {
    let namespace;

    if ( get(this, 'mode') === REUSE ) {
      namespace = get(this, 'choices').findBy('id', get(this, 'reuseNamespaceId'));
    }

    if ( !namespace ) {
      namespace = get(this, 'createNamespace');
    }

    set(this, 'namespace', namespace);
  }),

  validate: observer('namespace.{id,name}', function() {
    let intl = get(this, 'intl');
    let errors = [];

    let namespace = get(this, 'namespace');

    if ( namespace && get(namespace, 'name') ) {
      namespace.validationErrors().forEach((err) => {
        errors.push(intl.t('formNamespace.errors.validation', { error: err }))
      });
    } else {
      errors.push(intl.t('validation.required', { key: intl.t('generic.namespace') }));
    }

    if ( errors.length ) {
      set(this, 'errors', errors);
    } else {
      set(this, 'errors', null);
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
      return newNamespace.waitForState('active');
    }).catch((err) => {
      set(this, 'errors', [err.message]);

      return reject(err);
    });
  },
});
