import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';
import layout from './template';


export default Component.extend(ClusterDriver, {
  layout,
  configField: 'importedConfig',
  growl: service(),
  settings: service(),

  step: 1,

  clusterChanged: observer('cluster.state', function() {
    if ( get(this, 'state') >= 2 ) {
      const state = get(this, 'cluster.state')
      if ( ! ['pending','initializing'].includes(state) ) {
        this.send('close');
      }
    }
  }),

  doneSaving() {
    const cluster = get(this,'cluster');
    return cluster.getOrCreateToken().then((token) => {
      set(this, 'token', token);
      set(this, 'step', 2);
    });
  },
});
