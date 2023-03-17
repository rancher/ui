import Component from '@ember/component';
import { computed, get, observer, set } from '@ember/object';
import { alias, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { resolve } from 'rsvp';
import ClusterDriver from 'shared/mixins/cluster-driver';
import layout from './template';
import { coerceVersion, satisfies } from 'shared/utils/parse-version';


export default Component.extend(ClusterDriver, {
  globalStore:  service(),
  growl:        service(),
  settings:     service(),
  intl:         service(),
  modalService: service('modal'),


  layout,
  configField:     'importedConfig',
  step:            1,
  nodeForInfo:     null,
  isDockerCluster: false,

  isEdit:        equal('mode', 'edit'),
  isView:        equal('mode', 'view'),
  clusterState:  alias('model.originalCluster.state'),
  isK3sCluster:  equal('model.cluster.driver', 'k3s'),
  isRke2Cluster: equal('model.cluster.driver', 'rke2'),

  nodes: computed.reads('model.cluster.masterNodes'),

  didReceiveAttrs() {
    if ( get(this, 'isEdit') ) {
      if (this.isK3sCluster) {
        set(this, 'configField', 'k3sConfig');

        if (this.model.cluster.masterNodes.length === 1) {
          set(this, 'nodeForInfo', this.model.cluster.masterNodes.firstObject);
        }

        if (isEmpty(this.model.cluster.k3sConfig)) {
          set(this, 'isDockerCluster', true);
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

    promptUpgradeWarning(cb){
      if (!get(this, 'needsUpgradeWarning')){
        this.send('driverSave', cb);

        return
      }
      const { modalService } = this;
      const { isK3sCluster } = this;

      modalService.toggleModal('modal-confirm-imported-upgrade', {
        finish: this.confirmUpgrade.bind(this),
        btnCB:  cb,
        isK3sCluster,
      });
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

  nodesOptions: computed('nodes.@each.state', function() {
    return this.nodes.map((node) => ( {
      id:          node.id,
      displayName: node.displayName
    } ));
  }),

  // warn the user about manual PSP migration if upgrading from rke2/k3s <1.25 to >=1.25
  needsUpgradeWarning: computed('config.kubernetesVersion', 'configField', 'isEdit', 'isK3sCluster', 'isRke2Cluster', 'model.originalCluster', function() {
    const isEdit = get(this, 'isEdit')
    const isK3sCluster = get(this, 'isK3sCluster')
    const isRke2Cluster = get(this, 'isRke2Cluster')


    if (!isEdit){
      return
    }
    const configField = get(this, 'configField')
    const originalCluster = get(this, 'model.originalCluster')
    const originalVersion = coerceVersion(originalCluster[configField]?.kubernetesVersion);
    const currentVersion = coerceVersion(get(this, 'config.kubernetesVersion'))
    const canUpgrade = originalVersion && currentVersion && (isK3sCluster || isRke2Cluster)

    return canUpgrade && satisfies(currentVersion, '>=1.25.0') && satisfies(originalVersion, '<1.25.0')
  }),

  confirmUpgrade(cbToCloseModal, canceled = false, btnCB){
    if (cbToCloseModal) {
      cbToCloseModal();
    }

    if (canceled){
      btnCB(false)
    } else {
      this.send('driverSave', btnCB);
    }
  },

  willSave() {
    const {
      configField: field,
      config
    } = this;

    let errors = [];

    if (field === 'k3sConfig' && !isEmpty(config)) {
      if (config.k3supgradeStrategy) {
        // doesn't work because missing deep validation
        // errors = config.k3supgradeStrategy.validationErrors();
        if (config.k3supgradeStrategy.serverConcurrency <= 0 || config.k3supgradeStrategy.workerConcurrency <= 0) {
          errors.push(this.intl.t('clusterNew.k3simport.errors.concurrency.negative'))
        }
      }
    }

    if (!isEmpty(errors)) {
      set(this, 'errors', errors);

      return false;
    }

    return this._super();
  },

  doneSaving() {
    return this.loadToken();
  },

  loadToken() {
    set(this, 'step', 2);

    return resolve();
  }
});
