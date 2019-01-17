import { get, set, observer, computed } from '@ember/object';
import { next } from '@ember/runloop';
import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { parseSi } from 'shared/utils/parse-unit';
import { convertToMillis } from 'shared/utils/util';
import layout from './template';

const GPU_KEY = 'nvidia.com/gpu';

export default Component.extend({
  layout,

  classNames: ['accordion-wrapper'],

  // Inputs
  instance:   null,
  service:    null,
  editing:    true,
  isSidekick: null,

  // ----------------------------------
  capabilityChoices:    null,
  // ----------------------------------
  memoryMode:           'unlimited',
  // unlimited, set
  memoryMb:             null,
  // Memory
  memoryReservationMb:  null,
  // ----------------------------------
  cpuMode:              'unlimited',
  // unlimited, set
  cpuMillis:            null,
  // CPU
  cpuReservationMillis: null,
  // ----------------------------------
  gpuReservation:       null,
  limits:               alias('instance.resources.limits'),
  requests:             alias('instance.resources.requests'),

  init() {
    this._super(...arguments);

    if ( !get(this, 'instance.resources') ) {
      set(this, 'instance.resources', {
        requests: {},
        limits:   {}
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

  actions: {
    modifyCapabilities(type, select) {
      let options = Array.prototype.slice.call(select.target.options, 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => selectedOptions.push(cap.value));

      set(this, `instance.${ type }`, selectedOptions);
    },
  },

  // ----------------------------------
  privilegedChanged: observer('instance.privileged', 'instance.capAdd.[]', function() {
    if (get(this, 'instance.privileged') || (get(this, 'instance.capAdd') && get(this, 'instance.capAdd').indexOf('SYS_ADMIN') > -1)) {
      set(this, 'instance.allowPrivilegeEscalation', true);
    }
  }),

  memoryDidChange: observer('memoryMb', 'memoryMode', function() {
    next(this, 'updateMemory');
  }),

  memoryReservationChanged: observer('memoryReservationMb', function() {
    var mem = get(this, 'memoryReservationMb');

    if (isNaN(mem) || mem <= 0) {
      const requests = get(this, 'instance.resources.requests');

      delete requests['memory'];
    } else {
      set(this, 'instance.resources.requests.memory', `${ mem }Mi`);
    }
  }),

  cpuDidChange: observer('cpuMillis', 'cpuMode', function() {
    next(this, 'updateCpu');
  }),

  cpuReservationChanged: observer('cpuReservationMillis', function() {
    var cpu = get(this, 'cpuReservationMillis');

    if (isNaN(cpu) || cpu <= 0) {
      const requests = get(this, 'instance.resources.requests');

      delete requests['cpu']
    } else {
      set(this, 'instance.resources.requests.cpu', `${ cpu }m`);
    }
  }),

  updateGpu: observer('gpuReservation', function() {
    var gpu = get(this, 'gpuReservation');

    const requests = get(this, 'instance.resources.requests');
    const limits = get(this, 'instance.resources.limits');

    if (isNaN(gpu) || gpu <= 0) {
      delete requests[GPU_KEY];
      delete limits[GPU_KEY];
    } else {
      requests[GPU_KEY] = `${ gpu }`;
      limits[GPU_KEY] = `${ gpu }`;
    }
  }),

  // 2) has CAP_SYS_ADMIN
  allowPrivilegeEscalationDisabled: computed('instance.privileged', 'instance.capAdd.[]', function() {
    return get(this, 'instance.privileged') || (get(this, 'instance.capAdd') && get(this, 'instance.capAdd').indexOf('SYS_ADMIN') > -1);
  }),

  // ----------------------------------
  // Capability
  initCapability() {
    set(this, 'instance.capAdd', get(this, 'instance.capAdd') || []);
    set(this, 'instance.capDrop', get(this, 'instance.capDrop') || []);
    var choices = get(this, 'store').getById('schema', 'container')
      .optionsFor('capAdd')
      .sort();

    set(this, 'capabilityChoices', choices);
  },

  // ----------------------------------
  // AllowPrivilegeEscalation
  // It is true always when the container is:
  // 1) run as Privileged
  // ----------------------------------
  initMemory() {
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
    this.memoryReservationChanged();
  },

  updateMemory() {
    let mem = parseInt(get(this, 'memoryMb'), 10);
    let memoryMode = get(this, 'memoryMode');

    // Memory
    if (memoryMode === 'unlimited' || isNaN(mem) || mem <= 0) {
      const limits = get(this, 'instance.resources.limits');

      delete limits['memory'];

      return;
    }

    set(this, 'instance.resources.limits.memory', `${ mem }Mi`);
  },

  // ----------------------------------
  initCpu() {
    var cpu = get(this, 'instance.resources.limits.cpu');
    var cpuReservation = get(this, 'instance.resources.requests.cpu');

    set(this, 'cpuReservationMillis', convertToMillis(cpuReservation));

    if (cpu) {
      set(this, 'cpuMillis', convertToMillis(cpu));
      set(this, 'cpuMode', 'set');
    } else {
      set(this, 'cpuMillis', 1000);
      set(this, 'cpuMode', 'unlimited');
    }
    this.updateCpu();
    this.cpuReservationChanged();
  },

  updateCpu() {
    let cpu = parseInt(get(this, 'cpuMillis'), 10);
    let cpuMode = get(this, 'cpuMode');

    if (cpuMode === 'unlimited' || isNaN(cpu) || cpu <= 0) {
      const limits = get(this, 'instance.resources.limits');

      delete limits['cpu'];

      return;
    }

    set(this, 'instance.resources.limits.cpu', `${ cpu }m`);
  },

  // ----------------------------------
  // GPU
  initGpu() {
    var gpu = (get(this, 'instance.resources.limits') || {})[GPU_KEY];

    set(this, 'gpuReservation', gpu);
    this.updateGpu();
  },
});
