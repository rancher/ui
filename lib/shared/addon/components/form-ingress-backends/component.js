import { get, set, observer, computed } from '@ember/object'
import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';

export default Component.extend({
  intl: service(),

  layout,
  ingress:   null,
  rule:      null,
  isDefault: null,
  editing:   true,

  pathArray: null,

  init() {
    this._super(...arguments);
    this.initPathArray();
  },

  didInsertElement() {
    if (get(this, 'editing') && get(this, 'pathArray.length') === 0) {
      this.send('addPath', 'workload');
    }
  },

  actions: {
    addPath(backendType) {
      get(this, 'pathArray').pushObject({
        backendType,
        targetPort: '',
        serviceId:  '',
        path:       '',
      });
    },

    removePath(path) {
      get(this, 'pathArray').removeObject(path);
    },
  },

  pathsChanged: observer('pathArray.@each.{path,backendType,targetPort,serviceId}', 'isDefault', function() {
    if (get(this, 'isDefault')) {
      this.setDefaultBackend();
    } else {
      this.setPaths();
    }
  }),

  servicesDidChange: observer('pathArray.@each.{service}', function() {
    const pathArray = get(this, 'pathArray');

    pathArray.forEach((path) => {
      const backendType = get(path, 'backendType');
      const targetPort = get(path, 'targetPort');
      const availablePorts = get(path, 'service.availablePorts') || [];
      const hasPorts = get(path, 'service.availablePorts.length') > 0;

      if (backendType === 'service' && hasPorts && !availablePorts.find((p) => p.port === targetPort)) {
        set(path, 'targetPort', get(path, 'service.availablePorts.firstObject.port'));
      }
    });
  }),

  hasServiceTargets: computed('pathArray.@each.backendType}', function() {
    return !!get(this, 'pathArray').findBy('backendType', 'service');
  }),

  initPathArray() {
    const pathArray = [];
    const paths = get(this, 'rule.paths') || [];

    paths.forEach((path) => {
      if (get(path, 'serviceId')) {
        pathArray.pushObject(get(this, 'store').createRecord({
          type:        'httpingresspath',
          backendType: 'service',
          targetPort:  `${ get(path, 'targetPort') || ''  }`,
          serviceId:   get(path, 'serviceId').replace('/', ':'),
          path:        get(path, 'path'),
        }));
      } else if (get(path, 'workloadIds')) {
        get(path, 'workloadIds').forEach((workload) => {
          pathArray.pushObject({
            backendType: 'workload',
            targetPort:  get(path, 'targetPort'),
            serviceId:   workload,
            path:        get(path, 'path'),
          });
        });
      }
    });
    set(this, 'pathArray', pathArray);
  },

  setDefaultBackend() {
    const pathArray = get(this, 'pathArray');
    let defaultBackend = { workloadIds: [], };

    pathArray.forEach((path) => {
      const backendType = get(path, 'backendType');
      const serviceId = get(path, 'serviceId');
      const targetPort = get(path, 'targetPort');

      if (backendType === 'service') {
        defaultBackend.serviceId = serviceId;
      } else if (backendType === 'workload') {
        defaultBackend.workloadIds.pushObject(serviceId);
      }
      defaultBackend.targetPort = targetPort;
    });
    set(this, 'ingress.defaultBackend', defaultBackend);
  },

  setPaths() {
    const pathArray = get(this, 'pathArray');
    const paths = [];

    pathArray.forEach((item) => {
      const backendType = get(item, 'backendType');
      const path = get(item, 'path');
      const serviceId = get(item, 'serviceId');
      const targetPort = get(item, 'targetPort');

      if (backendType === 'service') {
        paths.pushObject({
          path,
          serviceId,
          targetPort,
        });
      } else if (backendType === 'workload') {
        paths.pushObject({
          path,
          workloadIds: [serviceId],
          targetPort,
        });
      }
    })
    set(this, 'rule.paths', paths);
  }
});
