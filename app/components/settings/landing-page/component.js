import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend({
  prefs:         service(),
  layout,
  value: null,

  init() {
    this._super(...arguments);

    let value = this.get(`prefs.${ C.PREFS.LANDING }`);

    this.set('value', value);
  },

  valueChanged: observer('value', function() {
    this.set(`prefs.${ C.PREFS.LANDING }`, this.value);
  }),
});
