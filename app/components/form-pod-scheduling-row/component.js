import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';

const TYPE = ['affinity', 'antiAffinity'];
const PRIORITY = ['required', 'preferred'];

export default Component.extend({
  layout,
  editing:       true,
  showNamespace: 'false',

  priorityChoices:  [],
  typeChoices:      [],
  topologyChoices:  [],
  _namespaces:      null,

  init() {
    this._super(...arguments);
    this.initTypeChoices();
    this.initPriorityChoices();
    this.initTopologyChoices();

    if (!!get(this, 'model.namespaces')) {
      set(this, '_namespaces', get(this, 'model.namespaces').toString());
    }
  },

  actions: {
    remove() {
      if (this.remove) {
        this.remove(this.model);
      }
    },

    modifyNamespaces(select) {
      let options = Array.prototype.slice.call(select.target.options, 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((ns) => selectedOptions.push(ns.value));

      set(this, 'model.namespaces', selectedOptions);
    },

  },

  termsChanged: observer('model.labelSelector.matchExpressions.@each.{key,operater,values}', 'model.{priority,type,topologyKey,weight}', 'model.namespaces.[]', function() {
    if (this.update) {
      this.update();
    }
  }),

  namepsacesChanged: observer('_namespaces', function() {
    if (!get(this, '_namespaces')) {
      set(this, 'model.namespaces', []);
    } else {
      set(this, 'model.namespaces', get(this, '_namespaces').split(','));
    }
  }),

  weightChanged: observer('model.weight', function() {
    if (!!get(this, 'model.weight')) {
      set(this, 'model.priority', 'preferred');
    } else {
      set(this, 'model.priority', 'required');
    }
  }),

  initTopologyChoices: observer('nodes.[]', function() {
    const uniqueObj = {};

    get(this, 'nodes').forEach((node) => {
      Object.keys(node.metadata.labels).forEach((l) => (uniqueObj[l] = true));
    });

    set(this, 'topologyChoices', Object.keys(uniqueObj).sort().map((k) => {
      return {
        label: k,
        value: k
      }
    }));
  }),

  showNamepsaceChanged: observer('showNamespace', function() {
    if (get(this, 'showNamespace') === 'true') {
      set(this, 'model.namespaces', []);
      set(this, '_namespaces', null);
    } else {
      set(this, 'model.namespaces', null);
      set(this, '_namespaces', '');
    }
  }),

  initTypeChoices() {
    set(this, 'typeChoices', TYPE.map((k) => {
      return {
        translationKey: `nodeDriver.harvester.scheduling.input.type.${ k }`,
        value:          k,
      };
    }));
  },

  initPriorityChoices() {
    set(this, 'priorityChoices', PRIORITY.map((k) => {
      return {
        translationKey: `nodeDriver.harvester.scheduling.input.priority.${ k }`,
        value:          k,
      };
    }));
  },

});
