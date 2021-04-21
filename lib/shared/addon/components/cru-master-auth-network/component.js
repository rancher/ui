import Component from '@ember/component';
import { get, observer, set } from '@ember/object';
import layout from './template';

export default Component.extend({
  layout,

  editing:       false,
  isNew:         true,
  config:        null,
  clusterConfig: null,


  privateClusterChanged: observer('clusterConfig.privateClusterConfig.enablePrivateEndpoint', function() {
    const config = get(this, 'config') || { enabled: false };
    const clusterConfig = get(this, 'clusterConfig') || { privateClusterConfig: { enablePrivateEndpoint: false }};

    if (clusterConfig.privateClusterConfig.enablePrivateEndpoint && !config.enabled) {
      set(this, 'config.enabled', true);
    }
  }),
});
