import Component from '@ember/component'
import ClusterDriver from 'shared/mixins/cluster-driver';
import { inject as service } from '@ember/service';
import { computed, get, set, observer } from '@ember/object';
import { alias, equal } from '@ember/object/computed';
import layout from './template';
import { isEmpty } from '@ember/utils';

const CLUSTER_ADMIN = 'kubectl create clusterrolebinding cluster-admin-binding --clusterrole cluster-admin --user [USER_ACCOUNT]';

export default Component.extend(ClusterDriver, {
  globalStore: service(),
  growl:       service(),
  settings:    service(),
  intl:        service(),

  layout,
  configField:   'importedConfig',
  step:          1,
  loading:       false,
  nodeForInfo:   null,
  clusterAdmin:  CLUSTER_ADMIN,

  isEdit:        equal('mode', 'edit'),
  clusterState:  alias('model.originalCluster.state'),
  isK3sCluster:  equal('model.cluster.driver', 'k3s'),
  isRke2Cluster: equal('model.cluster.driver', 'rke2'),

  didReceiveAttrs() {
    if ( get(this, 'isEdit') &&
         get(this, 'clusterState') === 'pending'
    ) {
      this.loadToken();
    }

    if ( get(this, 'isEdit') ) {
      if (this.isK3sCluster) {
        set(this, 'configField', 'k3sConfig');

        if (this.model.cluster.masterNodes.length === 1) {
          set(this, 'nodeForInfo', this.model.cluster.masterNodes.firstObject);
        }

        if (isEmpty(this.model.cluster.k3sConfig)) {
          set(this, 'model.cluster.k3sConfig', this.globalStore.createRecord({
            type:              'k3sConfig',
            kubernetesVersion: this.cluster.version.gitVersion
          }));
        }
      } else if (this.isRke2Cluster) {
        set(this, 'configField', 'rke2Config');

        if (this.model.cluster.masterNodes.length === 1) {
          set(this, 'nodeForInfo', this.model.cluster.masterNodes.firstObject);
        }

        if (isEmpty(this.model.cluster.rke2Config)) {
          set(this, 'model.cluster.rke2Config', this.globalStore.createRecord({
            type:              'rke2Config',
            kubernetesVersion: this.cluster.version.gitVersion
          }));
        }
      }
    }
  },

  actions: {
    setActiveNodeForInfo(selection) {
      const node = selection ? this.nodes.findBy('id', selection.id) : null;

      set(this, 'nodeForInfo', node);
    },
  },

  clusterChanged: observer('originalCluster.state', function() {
    if ( get(this, 'step') >= 2 ) {
      const state = get(this, 'originalCluster.state')

      if ( !['pending', 'initializing', 'active'].includes(state) ) {
        if (this.close) {
          this.close();
        }
      }
    }
  }),

  nodeInfoId: computed({
    get() {
      const { nodeForInfo } = this;

      if (isEmpty(nodeForInfo)) {
        return null;
      } else {
        return nodeForInfo.id
      }
    },

    set(key, value) {
      const { nodeForInfo } = this;

      if (!isEmpty(nodeForInfo)) {
        set(nodeForInfo, 'id', value);
      }

      return value;
    },
  }),

  nodes: computed('model.cluster.masterNodes.@each.{state}',  function() {
    return this.model.cluster.masterNodes;
  }),

  nodesOptions: computed('nodes.@each.{state}', function() {
    return this.nodes.map((node) => ( {
      id:          node.id,
      displayName: node.displayName
    } ));
  }),

  willSave() {
    const {
      configField: field,
      config
    } = this;
    let errors = [];

    if (field === 'k3sConfig' || field === 'rke2Config' ) {
      if (config.k3supgradeStrategy) {
        // doesn't work because missing deep validation
        // errors = config.k3supgradeStrategy.validationErrors();
        if (config.k3supgradeStrategy.serverConcurrency <= 0 || config.k3supgradeStrategy.workerConcurrency <= 0) {
          errors.push(this.intl.t('clusterNew.k3simport.errors.concurrency.negative'))
        }
      }
      if (config.rke2upgradeStrategy) {

      }
    }

    if (!isEmpty(errors)) {
      set(this, 'errors', errors);

      return false;
    }

    return this._super();
  },

  doneSaving() {
    if ( get(this, 'isEdit') ) {
      if (this.close) {
        this.close();
      }
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
