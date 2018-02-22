import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';
import { alias, equal } from '@ember/object/computed';
import layout from './template';


export default Component.extend(ClusterDriver, {
  layout,
  configField: 'importedConfig',
  growl: service(),
  settings: service(),

  isEdit: equal('mode', 'edit'),
  clusterState: alias('model.originalCluster.state'),

  step: 1,

  didReceiveAttrs() {
    if ( get(this,'isEdit') &&
         get(this, 'clusterState') === 'pending'
       ) {
      this.loadToken();
    }
  },

  doneSaving() {
    if ( get(this,'isEdit') ) {
      this.sendAction('close');
    } else {
      return loadToken();
    }
  },

  clusterChanged: observer('cluster.state', function() {
    if ( get(this, 'step') >= 2 ) {
      const state = get(this, 'cluster.state')
      if ( ! ['pending','initializing'].includes(state) ) {
        this.send('close');
      }
    }
  }),

  loadToken() {
    const cluster = get(this,'cluster');
    return cluster.getOrCreateToken().then((token) => {
      set(this, 'token', token);
      set(this, 'step', 2);
    });
  }
});
