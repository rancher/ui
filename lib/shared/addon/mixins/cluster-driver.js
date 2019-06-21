import Mixin from '@ember/object/mixin';
import { get, set, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { resolve } from 'rsvp';
import { inject as service } from '@ember/service';

export default Mixin.create({
  configField: '<override me>',

  mode:  null,
  save:  null, // Action to save
  close: null, // Action on complete

  globalStore: service(),

  cluster:         alias('model.cluster'),
  primaryResource: alias('model.cluster'),
  errors:          null,

  config: computed('configField', function() {
    const field = `cluster.${  get(this, 'configField') }`;

    return get(this, field);
  }),

  actions: {
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
        this.close();
      }
    },
  },

  willSave() {
    const cluster = get(this, 'cluster');
    const field = get(this, 'configField');

    cluster.clearProvidersExcept(field);

    set(this, 'errors', null);
    const ok = this.validate();

    return ok;
  },

  validate() {
    const model = get(this, 'cluster');
    const errors = model.validationErrors();

    set(this, 'errors', errors);

    return errors.length === 0;
  },

  doneSaving() {
    return resolve();
  }
});
