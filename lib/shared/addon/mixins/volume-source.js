import Mixin from '@ember/object/mixin';
import { get, set } from '@ember/object';

export default Mixin.create({
  // Inputs from comonent caller
  volume: null,
  editing: null,

  // Override from component definition
  field: null,

  // Locals
  config: null,

  didReceiveAttrs() {
    this._super(...arguments);

    const field = get(this,'field');
    let config = get(this, `volume.${field}`);
    if ( !config ) {
      config = this.configForNew();
      set(this, `volume.${field}`, config);
    }

    set(this, 'config', config);
  },
});
