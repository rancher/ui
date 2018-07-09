import { alias } from '@ember/object/computed';
import {
  get, set, computed
} from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { inject as service } from '@ember/service';
import C from 'shared/utils/constants';

const DRIVER = 'vmwarevsphere';
const CONFIG = 'vmwarevsphereConfig';

export default Component.extend(NodeDriver, {
  settings: service(),

  layout,
  driverName:     DRIVER,
  model:          null,
  showEngineUrl:  false,
  initParamArray: null,

  config:  alias(`model.${ CONFIG }`),
  network: computed('config.network', {
    get() {

      return get(this, 'config.network.firstObject');

    },
    set(k, value) {

      set(this, 'config.network', [value]);

      return value;

    }
  }),

  init() {

    this._super(...arguments);
    this.initCfgParam();

  },

  actions: {
    paramChanged(array) {

      const out = [];

      array.filter((param) => param.value && param.key).forEach((param) => {

        out.push(`${ param.key }=${ param.value }`);

      });
      set(this, 'config.cfgparam', out);

    }
  },

  bootstrap() {

    let iso = get(this, `settings.${ C.SETTING.ENGINE_ISO_URL }`) || 'https://releases.rancher.com/os/latest/rancheros-vmware.iso';

    let config = get(this, 'globalStore').createRecord({
      type:           CONFIG,
      password:       '',
      cpuCount:       2,
      memorySize:     2048,
      diskSize:       20000,
      vcenterPort:    443,
      network:        [],
      boot2dockerUrl: iso,
    });

    set(this, `model.${ CONFIG }`, config);

  },

  initCfgParam() {

    const cfgparam = get(this, 'config.cfgparam') || [];

    set(this, 'initParamArray', []);
    (cfgparam || []).forEach((param) => {

      const index = (param || '').indexOf('=');

      if ( index > -1 ) {

        get(this, 'initParamArray').push({
          key:   param.slice(0, index),
          value: param.slice(index + 1),
        });

      }

    });

  },
});
