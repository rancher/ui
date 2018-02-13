import Component from '@ember/component'
import ClusterDriver from 'global-admin/mixins/cluster-driver';
import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';


export default Component.extend(ClusterDriver, {
  configField: 'importedConfig',
  growl: service(),
  settings: service(),

  loading: true,

  init() {
    this._super();

    const cluster = get(this,'cluster');
    return cluster.getOrCreateToken().then((token) => {
      set(this, 'token', token);
      set(this, 'loading', false);
    }).catch((err) => {
      get(this, 'growl').fromError(err);
    });
  },

  clusterChanged: observer('cluster.state', function() {
    const state = get(this, 'cluster.state')
    if ( ! ['pending','initializing'].includes(state) ) {
      this.send('close');
    }
  }),
});
