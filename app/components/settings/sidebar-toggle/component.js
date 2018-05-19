import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend({
  layout,

  prefs: service(),

  menu: computed(`prefs.${C.PREFS.MENU}`, function () {
    return get(this, `prefs.${C.PREFS.MENU}`) || 'top';
  }),

  actions: {
    toogleMenu: function (menu) {
      set(this, `prefs.${C.PREFS.MENU}`, menu);
    }
  },

});
