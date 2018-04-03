import { get, set, observer, computed } from '@ember/object';
import { next } from '@ember/runloop';
import Component from '@ember/component';
import { parseSi } from 'shared/utils/parse-unit';
import layout from './template';

const GPU_KEY = 'nvidia.com/gpu';

export default Component.extend({
  layout,

  classNames: ['accordion-wrapper'],

  // Inputs
  instance: null,
  service: null,
  editing: true,
  isSidekick: null,

  actions: {
    modifyCapabilities: function (type, select) {
      let options = Array.prototype.slice.call(select.target.options, 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      set(this, `instance.${type}`, selectedOptions);
    },
  },

  init() {
    this._super(...arguments);

    if ( !get(this, 'instance.resources') ) {
      set(this, 'instance.resources', {
        requests: {}, limits: {}
      });
    }

    if ( !get(this, 'instance.resources.requests') ) {
      set(this, 'instance.resources.requests', {});
    }

    if ( !get(this, 'instance.resources.limits') ) {
      set(this, 'instance.resources.limits', {});
    }

    this.initCapability();
    this.initMemory();
    this.initGpu();
    this.initCpu();
  },

  // ----------------------------------
  // Capability
  // ----------------------------------
  capabilityChoices: null,
  initCapability: function () {
    set(this, 'instance.capAdd', get(this, 'instance.capAdd') || []);
    set(this, 'instance.capDrop', get(this, 'instance.capDrop') || []);
    var choices = get(this, 'store').getById('schema', 'container').optionsFor('capAdd').sort();
    set(this, 'capabilityChoices', choices);
  },

  // ----------------------------------
  // AllowPrivilegeEscalation
  // It is true always when the container is:
  // 1) run as Privileged
  // 2) has CAP_SYS_ADMIN
  // ----------------------------------
  privilegedChanged: observer('instance.privileged', 'instance.capAdd.[]', function () {
    if (get(this, 'instance.privileged') || (get(this, 'instance.capAdd') && get(this, 'instance.capAdd').indexOf('SYS_ADMIN') > -1)) {
      set(this, 'instance.allowPrivilegeEscalation', true);
    }
  }),

  allowPrivilegeEscalationDisabled: computed('instance.privileged', 'instance.capAdd.[]', function () {
    return get(this, 'instance.privileged') || (get(this, 'instance.capAdd') && get(this, 'instance.capAdd').indexOf('SYS_ADMIN') > -1);
  }),

  // ----------------------------------
  // Memory
  // ----------------------------------
  memoryMode: 'unlimited', // unlimited, set
  memoryMb: null,
  memoryReservationMb: null,
  initMemory: function () {
    var mem = get(this, 'instance.resources.limits.memory');
    var memReservation = get(this, 'instance.resources.requests.memory');
    if (memReservation) {
      set(this, 'memoryReservationMb', parseSi(memReservation, 1024) / 1048576);
    } else {
      set(this, 'memoryReservationMb', '');
    }

    if (mem) {
      set(this, 'memoryMb', parseSi(mem, 1024) / 1048576);
      set(this, 'memoryMode', 'set');
    } else {
      set(this, 'memoryMb', 128);
      set(this, 'memoryMode', 'unlimited');
    }
    this.updateMemory();
  },

  updateMemory: function () {
    let mem = parseInt(get(this, 'memoryMb'), 10);
    let memoryMode = get(this, 'memoryMode');

    // Memory
    if (memoryMode === 'unlimited' || isNaN(mem) || mem <= 0) {
      set(this, 'instance.resources.limits.memory', null);
      return;
    }

    set(this, 'instance.resources.limits.memory', `${mem}Mi`);
  },

  memoryDidChange: observer('memoryMb', 'memoryMode', function () {
    next(this, 'updateMemory');
  }),

  memoryReservationChanged: observer('memoryReservationMb', function () {
    var mem = get(this, 'memoryReservationMb');
    if (isNaN(mem) || mem <= 0) {
      set(this, 'instance.resources.requests.memory', null);
    } else {
      set(this, 'instance.resources.requests.memory', `${mem}Mi`);
    }
  }),

  // ----------------------------------
  // CPU
  // ----------------------------------
  cpuMode: 'unlimited', // unlimited, set
  cpuMillis: null,
  cpuReservationMillis: null,
  initCpu: function () {
    var cpu = get(this, 'instance.resources.limits.cpu.');
    var cpuReservation = get(this, 'instance.resources.requests.cpu');

    set(this, 'cpuReservationMillis', this.convertToMillis(cpuReservation));

    if (cpu) {
      set(this, 'cpuMillis', this.convertToMillis(cpu));
      set(this, 'cpuMode', 'set');
    } else {
      set(this, 'cpuMillis', 1000);
      set(this, 'cpuMode', 'unlimited');
    }
    this.updateCpu();
  },

  cpuDidChange: observer('cpuMillis', 'cpuMode', function () {
    next(this, 'updateCpu');
  }),

  updateCpu: function () {
    let cpu = parseInt(get(this, 'cpuMillis'), 10);
    let cpuMode = get(this, 'cpuMode');
    if (cpuMode === 'unlimited' || isNaN(cpu) || cpu <= 0) {
      set(this, 'instance.resources.limits.cpu', null);
      return;
    }

    set(this, 'instance.resources.limits.cpu', `${cpu}m`);
  },

  cpuReservationChanged: observer('cpuReservationMillis', function () {
    var cpu = get(this, 'cpuReservationMillis');

    if (isNaN(cpu) || cpu <= 0) {
      set(this, 'instance.resources.requests.cpu', null);
    } else {
      set(this, 'instance.resources.requests.cpu', `${cpu}m`);
    }
  }),

  // ----------------------------------
  // GPU
  // ----------------------------------
  gpuReservation: null,
  initGpu: function () {
    var gpu = (get(this, 'instance.resources.limits')||{})[GPU_KEY];
    set(this, 'gpuReservation', gpu);
    this.updateGpu();
  },

  updateGpu: observer('gpuReservation', function () {
    var gpu = get(this, 'gpuReservation');

    const requests = get(this, 'instance.resources.requests');
    const limits = get(this, 'instance.resources.limits');

    if (isNaN(gpu) || gpu <= 0) {
      requests[GPU_KEY] = null;
      limits[GPU_KEY] = null;
    } else {
      requests[GPU_KEY] = `${gpu}`;
      limits[GPU_KEY] = `${gpu}`;
    }
  }),

  convertToMillis(strValue) {
    if (!strValue) {
      return '';
    }
    if (strValue.endsWith('m')) {
      return parseInt(strValue.substr(0, strValue.length - 1), 10);
    } else {
      return parseInt(strValue, 10) * 1000;
    }
  },
});
