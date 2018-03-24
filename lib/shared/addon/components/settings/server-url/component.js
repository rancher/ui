import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

const SCHEME = 'https://';

export default Component.extend({
  layout,
  router:           service(),

  serverUrl:        null,
  serverUrlSetting: null,
  setServerUrl:     false,
  showHeader:       true,
  urlInvalid:       false,
  urlWarning:       null,
  scheme:           SCHEME,


  init() {
    this._super(...arguments);
    if (get(this, 'serverUrl') === null) {
      set(this, 'serverUrl', window.location.host);
    }
  },
  actions: {
    saveServerUrl() {
      let setting = get(this, 'serverUrlSetting');
      set(setting, 'value', `${SCHEME}${get(this, 'serverUrl')}`);
      setting.save().then(() => {
        get(this, 'router').replaceWith('authenticated');
      });
    },
  },

});
