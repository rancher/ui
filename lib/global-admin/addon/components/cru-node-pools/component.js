import Component from '@ember/component';
import layout from './template';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';

export default Component.extend({
  layout,
  globalStore:     service(),

  cluster: null,
  nodeTemplates: null,
  driver: null, // docker-machine driver

  originalPools: null,
  nodePools: null,

  init() {
    this._super(...arguments);
    const originalPools = (get(this,'cluster.nodePools')||[]).slice();
    set(this, 'originalPools', originalPools);
    set(this, 'nodePools', originalPools.slice());
    this.sendAction('registerHook', this.savePools.bind(this), 'savePools');
  },

  actions: {
    addPool() {
      let nodePools = get(this, 'nodePools');

      let templateId = null;
      const lastNode = nodePools[nodePools.length-1];
      if ( lastNode ) {
        templateId = get(lastNode, 'nodeTemplateId');
      }

      nodePools.pushObject(get(this, 'globalStore').createRecord({
        type: 'nodePool',
        nodeTemplateId: templateId
      }));
    },

    removePool(pool) {
      get(this, 'nodePools').removeObject(pool);
    },

    addNodeTemplate(node) {
      get(this,'modalService').toggleModal('modal-edit-node-template', {
        nodeTemplate: null,
        driver: get(this, 'driver'),
        onAdd: function(nodeTemplate) {
          set(node, 'nodeTemplateId', get(nodeTemplate, 'id'));
        },
      });
    },
  },

  savePools: function() {
    const nodePools = get(this, 'nodePools');
    const original = get(this, 'originalPools');

    const remove = [];
    original.forEach((pool) => {
      if ( !nodePools.includes(pool) ) {
        // Remove
        remove.push(pool);
      }
    });

    const clusterId = get(this, 'cluster.id');
    nodePools.forEach((pool) => {
      set(pool, 'clusterId', clusterId);
    });


    return PromiseAll(nodePools.map(x => x.save())).then(() => {
      return PromiseAll(remove.map(x => x.delete())).then(() => {
        return get(this, 'cluster');
      });
    });
  },

  filteredNodeTemplates: computed('driver','nodeTemplates.@each.{state,driver}', function() {
    const driver = get(this, 'driver');
    let templates = get(this, 'nodeTemplates').filterBy('state','active').filterBy('driver', driver);
    return templates;
  }),

  _nodeCountFor(role) {
    let count = 0;
    (get(this, 'cluster.nodePools')||[]).filterBy(role,true).forEach((pool) => {
      let more = get(pool, 'quantity');
      if ( more ) {
        more = parseInt(more, 10);
      }

      count += more;
    });

    return count;
  },

  etcdOk: computed('cluster.nodePools.@each.{quantity,etcd}', function() {
    let count = this._nodeCountFor('etcd');
    return count === 1 || count === 3 || count === 5
  }),

  controlPlaneOk: computed('cluster.nodePools.@each.{quantity,controlPlane}', function() {
    let count = this._nodeCountFor('controlPlane');
    return count >= 1;
  }),

  workerOk: computed('cluster.nodePools.@each.{quantity,worker}', function() {
    let count = this._nodeCountFor('worker');
    return count >= 1;
  }),

});
