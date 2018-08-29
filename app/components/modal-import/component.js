import Component from '@ember/component';
import { get, set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import CodeMirror from 'codemirror';
import jsyaml from 'js-yaml';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import ChildHook from 'shared/mixins/child-hook';

export default Component.extend(ModalBase, ChildHook, {
  intl:  service(),
  growl: service(),
  scope: service(),
  store: service('store'),

  layout,
  mode:      'project',
  namespace: null,
  yaml:      '',

  errors:     null,
  compose:    null,
  classNames: ['modal-container', 'large-modal', 'fullscreen-modal', 'modal-shell', 'alert'],

  init() {
    this._super(...arguments);
    window.jsyaml || (window.jsyaml = jsyaml);
  },

  actions: {
    cancel() {
      return this._super(...arguments);
    },

    close() {
      return this._super(...arguments);
    },

    save(cb) {
      let yaml = get(this, 'yaml');
      const lintError = [];

      jsyaml.safeLoadAll(yaml, (y) => {
        lintError.pushObjects(CodeMirror.lint.yaml(y));
      });

      if ( lintError.length ) {
        set(this, 'errors', [get(this, 'intl').t('yamlPage.errors')]);
        cb(false);

        return;
      }

      set(this, 'errors', null);

      const opts = { yaml: get(this, 'yaml'), };

      switch ( get(this, 'mode') ) {
      case 'namespace':
        opts.namespace = get(this, 'namespace.name');
        break;
      case 'project':
        opts.project = get(this, 'projectId');
        opts.defaultNamespace = get(this, 'namespace.name');
        break;
      case 'cluster':
        break;
      }

      if ( get(this, 'mode') === 'cluster' ) {
        this.send('actuallySave', opts, cb);
      } else {
        return this.applyHooks('_beforeSaveHooks').then(() => {
          this.send('actuallySave', opts, cb);
        })
          .catch(() => {
            cb(false);
          });
      }
    },

    actuallySave(opts, cb) {
      return get(this, 'scope.currentCluster').doAction('importYaml', opts)
        .then(() => {
          cb();
          this.send('cancel');
        })
        .catch(() => {
          cb(false);
        });
    }
  },

  lintObserver: observer('yaml', function() {
    const yaml = get(this, 'yaml');
    const lintError = [];

    jsyaml.safeLoadAll(yaml, (y) => {
      lintError.pushObjects(CodeMirror.lint.yaml(y));
    });

    if ( lintError.length ) {
      set(this, 'errors', null);
    }
  }),

});
