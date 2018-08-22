import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import { inject as service } from '@ember/service';
import { get, set, observer } from '@ember/object';
import { alias, equal } from '@ember/object/computed';
import layout from './template';

const CLUSTER_ADMIN = 'kubectl create clusterrolebinding cluster-admin-binding --clusterrole cluster-admin --user [USER_ACCOUNT]';

export default Component.extend(ClusterDriver, {
  growl:       service(),
  settings:    service(),

  layout,
  configField:  'importedConfig',
  step:         1,
  loading:      false,
  clusterAdmin: CLUSTER_ADMIN,

  isEdit:       equal('mode', 'edit'),
  clusterState: alias('model.originalCluster.state'),

  didReceiveAttrs() {
    if ( get(this, 'isEdit') &&
         get(this, 'clusterState') === 'pending'
    ) {
      this.loadToken();
    }
  },

  clusterChanged: observer('originalCluster.state', function() {
    if ( get(this, 'step') >= 2 ) {
      const state = get(this, 'originalCluster.state')

      if ( !['pending', 'initializing', 'active'].includes(state) ) {
        this.sendAction('close');
      }
    }
  }),

  doneSaving() {
    if ( get(this, 'isEdit') ) {
      this.sendAction('close');
    } else {
      return this.loadToken();
    }
  },

  loadToken() {
    const cluster = get(this, 'cluster');

    set(this, 'step', 2);
    set(this, 'loading', true);

    return cluster.getOrCreateToken().then((token) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      set(this, 'token', token);
      set(this, 'loading', false);
    }).catch((err) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      get(this, 'growl').fromError('Error getting command', err);
      set(this, 'loading', false);
    });
  }
});
