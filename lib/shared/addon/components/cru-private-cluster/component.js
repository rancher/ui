import Component from '@ember/component';
import layout from './template';
import { set } from '@ember/object';
import { next } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import { observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { inject as service } from '@ember/service'

const DEFAULT_PRIVATE_CONFIG = {
  enablePrivateEndpoint: false,
  enablePrivateNodes:    false,
  masterIpv4CidrBlock:   null,
};

export default Component.extend({
  settings: service(),
  layout,

  config:        null,
  mode:          'new',
  isNew:         true,
  editing:       false,
  defaultConfig: DEFAULT_PRIVATE_CONFIG,

  enablePrivateNodesChanged: on('init', observer('config.enablePrivateNodes', function() {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }

    const { config } = this;
    const {
      enablePrivateEndpoint,
      masterIpv4CidrBlock,
    } = this.defaultConfig;


    if (this.isNew && !config?.enablePrivateNodes) {
      next(this, () => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        if (!config.enablePrivateNodes) {
          set(this, 'config.enablePrivateEndpoint', enablePrivateEndpoint);
        }

        if (!isEmpty(config.masterIpv4CidrBlock)) {
          set(this, 'config.masterIpv4CidrBlock', masterIpv4CidrBlock);
        }
      });
    }
  }))

});
