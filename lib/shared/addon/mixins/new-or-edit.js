import { resolve } from 'rsvp';
import { alias } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import Resource from 'ember-api-store/models/resource';
import Errors from 'ui/utils/errors';
import { get, set } from '@ember/object';

export default Mixin.create({
  originalModel:           null,
  errors:                  null,
  editing:                 true,
  primaryResource:         alias('model'),
  originalPrimaryResource: alias('originalModel'),

  tagName: 'form', // This indirectly disables global navigation shortcut keys

  init() {
    this._super(...arguments);

    set(this, 'errors', null);
  },

  validate() {
    var model = get(this, 'primaryResource');
    var errors = model.validationErrors(['appliedSpec']);

    if ( errors.get('length') ) {
      set(this, 'errors', errors);

      return false;
    }

    set(this, 'errors', null);

    return true;
  },

  submit(event) {
    event.preventDefault();
    this.send('save');
  },

  actions: {
    error(err) {
      if (err) {
        var body = Errors.stringify(err);

        set(this, 'errors', [body]);
      } else {
        set(this, 'errors', null);
      }
    },

    save(cb) {
      cb = cb || function() {};

      // Will save can return true/false or a promise
      resolve(this.willSave()).then((ok) => {
        if ( !ok ) {
          // Validation or something else said not to save
          cb(false);

          return;
        }

        this.doSave()
          .then(this.didSave.bind(this))
          .then(this.doneSaving.bind(this))
          .then(() => {
            cb(true);
          })
          .catch((err) => {
            if ( this.isDestroyed || this.isDestroying ) {
              return;
            }

            this.send('error', err);
            this.errorSaving(err);
            cb(false);
          });
      });
    }
  },

  // willSave happens before save and can stop the save from happening
  willSave() {
    set(this, 'errors', null);
    var ok = this.validate();

    return ok;
  },

  doSave(opt) {
    // Pass this in case we need to check the previous model when saving
    return get(this, 'primaryResource').save(opt, this).then((newData) => {
      return this.mergeResult(newData);
    });
  },

  mergeResult(newData) {
    var original = get(this, 'originalPrimaryResource');

    if ( original ) {
      if ( Resource.detectInstance(original) ) {
        original.merge(newData);

        return original;
      }
    }

    return newData;
  },

  // didSave can be used to do additional saving of dependent resources
  didSave(neu) {
    return neu;
  },

  // doneSaving happens after didSave
  doneSaving(neu) {
    return neu || get(this, 'originalPrimaryResource') || get(this, 'primaryResource');
  },

  // errorSaving can be used to do additional cleanup of dependent resources on failure
  errorSaving(/* err*/) {
  },
});
