import Mixin from '@ember/object/mixin';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Mixin.create({
  intl: service(),

  config:        null,
  field:         null,
  errors:        null,
  defaultConfig: null,

  validate() {
    return [];
  },

  willSave() {},

  init() {
    this._super(...arguments);

    if ( get(this, `initConfig.${ get(this, 'field') }`) ) {
      set(this, 'config', Object.assign({}, get(this, 'initConfig')));
    } else {
      const defaultConfig = {};

      defaultConfig[get(this, 'field')] = Object.assign({}, get(this, 'defaultConfig'));
      set(this, 'config', Object.assign({}, defaultConfig));
    }
  },

  actions: {
    save(cb) {
      const errors = this.validate();

      if ( errors.length > 0 ) {
        set(this, 'errors', errors);
        cb();

        return;
      }
      this.willSave();
      const step = get(this, 'config');

      if (this.save) {
        this.save(step);
      }
      cb();
    },

    cancel() {
      if (this.cancel) {
        this.cancel();
      }
    },
  }
});
