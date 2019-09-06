import Component from '@ember/component';
import layout from './template';
import { get, set, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';
import { alias } from '@ember/object/computed';

const headers = [
  {
    name:           'hostnamePrefix',
    sort:           ['hostnamePrefix', 'id'],
    translationKey: 'clusterNew.rke.nodes.hostnamePrefix',
    scope:          'embedded',
  },
  {
    name:           'count',
    sort:           ['quantity', 'displayName.id'],
    translationKey: 'clusterNew.rke.nodes.count',
    width:          100,
  },
  {
    name:           'nodeTemplate',
    sort:           ['nodeTemplate.displayName', 'nodeTemplate.id'],
    translationKey: 'clusterNew.rke.nodes.template',
  },
  {
    name:           'deleteNotReadyAfterSecs',
    sort:           ['deleteNotReadyAfterSecs'],
    translationKey: 'clusterNew.rke.nodes.deleteNotReadyAfterSecs',
    width:          150,
  },
  {
    name:           'etcd',
    sort:           false,
    translationKey: 'clusterNew.rke.role.header.etcd',
    classNames:     ['text-center'],
    width:          100,
  },
  {
    name:           'controlplane',
    sort:           false,
    translationKey: 'clusterNew.rke.role.header.controlplane',
    classNames:     ['text-center'],
    width:          100,
  },
  {
    name:           'worker',
    sort:           false,
    translationKey: 'clusterNew.rke.role.header.worker',
    scope:          'embedded',
    classNames:     ['text-center'],
    width:          100,
  },
  {
    name:           'advanced',
    sort:           false,
    scope:          'embedded',
    translationKey: 'clusterNew.rke.nodes.taints',
    classNames:     ['text-center'],
    width:          100,
  },
  {
    name:       'remove',
    sort:       false,
    classNames: ['text-center'],
    width:      35,
  }
];

export default Component.extend({
  globalStore:  service(),
  modalService: service('modal'),
  intl:         service(),
  scope:        service(),

  layout,
  cluster:       null,
  nodeTemplates: null,
  driver:        null, // docker-machine driver

  originalPools: null,
  nodePools:     null,
  errors:        null,

  taintCapabilites:   alias('scope.currentCluster.capabilities.taintSupport'),

  init() {
    this._super(...arguments);
    const originalPools = (get(this, 'cluster.nodePools') || []).slice();

    set(this, 'originalPools', originalPools);
    set(this, 'nodePools', originalPools.slice().map((p) => p.clone()));

    if ( get(this, 'mode') === 'new' && get(originalPools, 'length') === 0 ) {
      get(this, 'nodePools').pushObject(get(this, 'globalStore').createRecord({
        type:     'nodePool',
        quantity: 1,
      }));
    }

    if (this.registerHook) {
      this.registerHook(this.savePools.bind(this), 'savePools')
    }

    this.setDefaultNodeTemplate();
  },

  didReceiveAttrs() {
    this.validate();
  },

  actions: {
    addPool() {
      let nodePools = get(this, 'nodePools');

      let templateId = null;
      const lastNode = nodePools[nodePools.length - 1];

      if ( lastNode ) {
        templateId = get(lastNode, 'nodeTemplateId');
      }

      nodePools.pushObject(get(this, 'globalStore').createRecord({
        type:           'nodePool',
        nodeTemplateId: templateId
      }));
    },

    removePool(pool) {
      get(this, 'nodePools').removeObject(pool);
    },

    addNodeTemplate(node) {
      get(this, 'modalService').toggleModal('modal-edit-node-template', {
        nodeTemplate: null,
        driver:       get(this, 'driver'),
        onAdd(nodeTemplate) {
          set(node, 'nodeTemplateId', get(nodeTemplate, 'id'));
        },
      });
    },

    configAdvancedOptions(pool) {
      get(this, 'modalService').toggleModal('modal-edit-node-pool', pool);
    },
  },

  setDefaultNodeTemplate: observer('driver', function() {
    const templates = get(this, 'filteredNodeTemplates') || [];

    if ( templates.length === 1 ) {
      (get(this, 'nodePools') || []).forEach((pool) => {
        if ( !get(pool, 'nodeTemplateId') ) {
          set(pool, 'nodeTemplateId', get(templates, 'firstObject.id'));
        }
      });
    }
  }),

  driverChanged: observer('driver', function() {
    const driver = get(this, 'driver');

    get(this, 'nodePools').forEach((pool) => {
      const tpl = get(pool, 'nodeTemplate');

      if ( tpl && get(tpl, 'driver') !== driver ) {
        set(pool, 'nodeTemplateId', null);
      }
    });
  }),

  validate: observer('etcdOk', 'controlPlaneOk', 'workerOk', 'nodePools.@each.{quantity,hostnamePrefix,nodeTemplateId}', 'nodePools.[]', 'driver', function() {
    const intl = get(this, 'intl');
    const driver = get(this, 'driver');

    const errors = [];

    if ( get(this, 'mode') === 'new' && !get(this, 'etcdOk') ) {
      errors.push(intl.t('clusterNew.rke.errors.etcd'));
    }

    if ( !get(this, 'controlPlaneOk') ) {
      errors.push(intl.t('clusterNew.rke.errors.controlPlane'));
    }

    if ( !get(this, 'workerOk') ) {
      errors.push(intl.t('clusterNew.rke.errors.worker'));
    }

    if ( driver === 'digitalocean') {
      const nodePools = get(this, 'nodePools');
      let isError = false;

      nodePools.map((p) => {
        const { hostnamePrefix = '' } = p;

        if (hostnamePrefix.includes('_')) {
          isError = true;
        }
      })

      if (isError) {
        errors.push(intl.t('nodeDriver.digitalocean.errors.hostnamePrefix'));
      }
    }

    get(this, 'nodePools').forEach((pool) => {
      // ClusterId is required but not known yet
      if ( !get(pool, 'clusterId') ) {
        set(pool, 'clusterId', '__later__');
      }
      errors.pushObjects(pool.validationErrors());
    });

    if (this.setNodePoolErrors) {
      this.setNodePoolErrors(errors);
    }
  }),
  showIamWarning: computed('driver', 'nodePools.@each.{nodeTemplateId}', 'cluster.rancherKubernetesEngineConfig.cloudProvider.name', function() {
    const cloudProvider = get(this, 'cluster.rancherKubernetesEngineConfig.cloudProvider.name');
    const driver = get(this, 'driver');

    if ( driver === 'amazonec2' && cloudProvider === 'aws' ) {
      const found = (get(this, 'nodePools') || []).some((pool) => {
        const nodeTemplate = get(pool, 'nodeTemplate');

        return nodeTemplate && !get(nodeTemplate, 'amazonec2Config.iamInstanceProfile');
      });

      return found ? true : false;
    }

    return false;
  }),

  filteredNodeTemplates: computed('driver', 'nodeTemplates.@each.{state,driver}', 'nodePools.@each.nodeTemplateId', function() {
    const driver = get(this, 'driver');
    let templates = get(this, 'nodeTemplates').filterBy('state', 'active').filterBy('driver', driver);

    (get(this, 'nodePools') || []).forEach((pool) => {
      const templateId = get(pool, 'nodeTemplateId');

      if ( templateId && !templates.findBy('id', templateId) ) {
        templates.push(get(this, 'globalStore').createRecord({
          type: 'nodetemplate',
          id:   templateId,
          name: `(${  templateId  })`,
        }));
      }
    });

    return templates;
  }),

  etcdOk: computed('nodePools.@each.{quantity,etcd}', function() {
    let count = this._nodeCountFor('etcd');

    return count === 1 || count === 3 || count === 5
  }),

  etcdCount: computed('nodePools.@each.{quantity,etcd}', function() {
    return this._nodeCountFor('etcd');
  }),

  controlPlaneOk: computed('nodePools.@each.{quantity,controlPlane}', function() {
    let count = this._nodeCountFor('controlPlane');

    return count >= 1;
  }),

  workerOk: computed('nodePools.@each.{quantity,worker}', function() {
    let count = this._nodeCountFor('worker');

    return count >= 1;
  }),

  headers: computed('taintCapabilites', 'mode', function() {
    const { taintCapabilites, mode } = this

    if (taintCapabilites || mode === 'new') {
      return headers
    } else {
      return headers.filter((h) => h.name !== 'advanced')
    }
  }),

  savePools() {
    if (this.isDestroyed || this.isDestroying || get(this, 'driver') === 'custom' ) {
      return;
    }

    const nodePools = get(this, 'nodePools');
    const original = get(this, 'originalPools');

    const remove = [];

    original.forEach((pool) => {
      if ( !nodePools.some((p) => p.id === pool.id) ) {
        // Remove
        remove.push(pool);
      }
    });

    const clusterId = get(this, 'cluster.id');

    nodePools.forEach((pool) => {
      set(pool, 'clusterId', clusterId);
    });


    return PromiseAll(nodePools.map((x) => x.save())).then(() => {
      return PromiseAll(remove.map((x) => x.delete())).then(() => {
        return get(this, 'cluster');
      });
    });
  },

  _nodeCountFor(role) {
    let count = 0;

    (get(this, 'nodePools') || []).filterBy(role, true).forEach((pool) => {
      let more = get(pool, 'quantity');

      if ( more ) {
        more = parseInt(more, 10);
      }

      count += more;
    });

    return count;
  },

});
