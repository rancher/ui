import { get, set, observer } from '@ember/object'
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,

  ingress: null,
  rule: null,
  checked: null,
  editing: true,

  pathArray: null,

  init() {
    this._super(...arguments);
    this.initPathArray();
  },

  actions: {
    addPath(backendType) {
      get(this, 'pathArray').pushObject({
        backendType,
        targetPort: '',
        serviceId: '',
        path: '',
      });
    },

    removePath(path) {
      get(this, 'pathArray').removeObject(path);
    },
  },

  initPathArray() {
    const pathArray = [];
    const paths = get(this, 'rule.paths');
    Object.keys(paths).forEach((p) => {
      const path = get(paths, p);
      if (get(path, 'serviceId')) {
        pathArray.pushObject(get(this, 'store').createRecord({
          type: 'httpingresspath',
          backendType: 'service',
          targetPort: get(path, 'targetPort'),
          serviceId: `${get(this, 'ingress.namespaceId')}:${get(path, 'serviceId')}`,
          path: p,
        }));
      }
    });
    console.log(pathArray)
    set(this, 'pathArray', pathArray);
  },

  didInsertElement: function() {
    if (get(this, 'editing') && get(this, 'pathArray.length') === 0) {
      this.send('addPath', 'workload');
    }
  },

  pathsChanged: observer('pathArray.@each.{path,backendType,targetPort,serviceId}', 'checked', function () {
    if (get(this, 'checked')) {
      this.setDefaultBackend();
    } else {
      this.setPaths();
    }
  }),

  setDefaultBackend() {
    const pathArray = get(this, 'pathArray');
    let defaultBackend = {
      workloadIds: [],
    };
    pathArray.forEach(path => {
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
    const paths = {};
    pathArray.forEach(path => {
      const backendType = get(path, 'backendType');
      const pathValue = get(path, 'path');
      const serviceId = get(path, 'serviceId');
      const targetPort = get(path, 'targetPort');
      if (backendType === 'service') {
        const found = paths[pathValue];
        if (found) {
          found.serviceId = serviceId;
          found.targetPort = targetPort;
        } else {
          paths[pathValue] = {
            serviceId,
            targetPort,
          };
        }
      } else if (backendType === 'workload') {
        const found = paths[pathValue];
        if (found && found.workloadIds) {
          found.workloadIds.pushObject(serviceId);
          found.targetPort = targetPort;
        } else {
          paths[pathValue] = {
            workloadIds: [serviceId],
            targetPort,
          };
        }
      }
    })
    set(this, 'rule.paths', paths);
  }
});
