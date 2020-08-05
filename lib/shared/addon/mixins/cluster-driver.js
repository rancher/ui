import Mixin from '@ember/object/mixin';
import { get, set, defineProperty, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { inject as service } from '@ember/service';
import { typeOf, isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';

export default Mixin.create({
  configField: '<override me>',

  mode:   null,
  save:   null, // Action to save
  close:  null, // Action on complete
  saving: false,
  saved:  false,

  globalStore: service(),

  cluster:         alias('model.cluster'),
  primaryResource: alias('model.cluster'),
  errors:          null,

  init() {
    this._super(...arguments);


    defineProperty(this, 'config', computed('configField', `primaryResource.${ this.configField }`, () => {
      return get(this, `cluster.${  get(this, 'configField') }`);
    }));
  },

  actions: {
    errorHandler(err, shouldClearPreviousErrors = false) {
      let { errors } = this;

      if (shouldClearPreviousErrors) {
        errors = set(this, 'errors', []);
      }

      if (errors) {
        if (isArray(err)) {
          errors.pushObjects(err);
        } else {
          errors.pushObject(err);
        }
      } else {
        errors = [err];
      }

      set(this, 'errors', errors);
    },
    driverSave(cb) {
      cb = cb || function() {};

      resolve(this.willSave()).then((ok) => {
        if ( !ok ) {
          // Validation or something else said not to save
          cb(false);

          return;
        }

        if (this.save) {
          this.save((ok) => {
            if ( ok ) {
              this.doneSaving().finally(() => {
                cb(ok);
              });
            } else {
              cb(ok);
            }
          })
        }
      });
    },

    setLabels(labels) {
      set(this, 'labels', labels);
      var out = {};

      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('labels', out);
    },

    registerHook() {
      const args = [].slice.call(arguments);

      args.unshift('registerHook');
      this.sendAction.apply(this, args);
    },

    close() {
      if (this.close) {
        this.close(this.saved);
      }
    },
  },

  willSave() {
    const { cluster, configField: field } = this;

    if (typeOf(cluster.clearProvidersExcept) === 'function') {
      cluster.clearProvidersExcept(field);
    }

    if (get(cluster, 'localClusterAuthEndpoint')) {
      if (!get(cluster, 'rancherKubernetesEngineConfig') || isEmpty(get(cluster, 'rancherKubernetesEngineConfig'))) {
        delete cluster.localClusterAuthEndpoint;
      }
    }

    set(this, 'errors', null);

    return this.validate();
  },

  validate() {
    const model = get(this, 'cluster');
    const errors = model.validationErrors(['appliedSpec']);

    set(this, 'errors', errors);

    return errors.length === 0;
  },

  doneSaving() {
    return resolve();
  }
});
