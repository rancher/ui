import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Route from '@ember/routing/route';
import Ember from 'ember';
import C from 'ui/utils/constants';

export default Route.extend({
  prefs: service(),
  clusterStore: service(),

  queryParams: {
    containerName: {
      refreshModel: true
    }
  },

  model: function(params/*, transition*/) {
    var store = this.get('store');

    if ( params.workloadId )
    {
      // Existing Service
      return store.find('workload', params.workloadId).then((workload) => {
        return this.modelForExisting(workload, params);
      });
    } else {
      return this.modelForNew(params);
    }
  },

  modelForNew(params) {
    let scaleMode = this.get(`prefs.${C.PREFS.LAST_SCALE_MODE}`) || 'deployment';
    if ( scaleMode === 'container' || scaleMode === 'service' ) {
      scaleMode = 'deployment';
    }

    //let isGlobal = (mode === 'global');

    return EmberObject.create({
      scaleMode,
      workload: this.emptyWorkload(params),
      container: this.emptyContainer(params),
      isUpgrade: false,
    });
  },

  modelForExisting(_workload, params) {
    if ( !_workload ) {
      return Ember.RVP.reject('Workload not found');
    }

    const clone = _workload.clone();
    const containerNames = clone.containers.map(x => get(x, 'name'));
    let containerName = params.containerName;

    // Add a sidekick
    if ( params.addSidekick ) {
      return EmberObject.create({
        scaleMode: 'sidekick',
        workload: clone,
        container: this.emptyContainer(params),
        isUpgrade: false,
      });
    } else if ( containerName === null ) {
      // Figure out the container name
      if ( containerNames.length > 1 ) {
        if ( params.upgrade ) {
          // If there are sidekicks, you need to pick one & come back
          return EmberObject.create({
            workload: clone,
            containerNames,
            selectLaunchConfig: true,
          });
        } else {
          // Clone with multiple containers not supported yet
          return Ember.RVP.reject("Cloning a workload with multiple containers not supported");
        }
      } else {
        // Otherwise use primary
        containerName = "";
      }
    }

    let container;
    if ( containerName === "" ) {
      // The primary/only container
      container = clone.containers[0];
    } else {
      // Existing container
      container = clone.containers.findBy('name', containerName);
    }

    if ( params.upgrade ) {
      // Upgrade workload
      let out = EmberObject.create({
        scaleMode: (containerName ? 'sidekick' : 'deployment'),
        workload: clone,
        container,
        containerName,
        isUpgrade: true
      });

      return out;
    } else {
      // Clone workload with one container
      let neu = this.get('store').createRecord(clone.serializeForNew());

      return EmberObject.create({
        mode: 'service',
        workload: neu,
        container,
        isUpgrade: false
        // no launchConfigIndex because this will be a new service or sidekick
      });
    }
  },

  getNamespaceId(params) {
    const clusterStore = this.get('clusterStore');

    let ns = null;
    if ( params.namespaceId ) {
      ns = clusterStore.getById('namespace', params.namespaceId);
    }

    if ( !ns ) {
      ns = clusterStore.getById('namespace', this.get(`prefs.${C.PREFS.LAST_NAMESPACE}`));
    }

    let namespaceId = null;
    if ( ns ) {
      namespaceId = ns.get('id');
    }
    return namespaceId;
  },

  emptyWorkload(params) {
    const store = this.get('store');
    return store.createRecord({
      type: 'workload',
      namespaceId: this.getNamespaceId(params),
      scale: 1,
      dnsPolicy: "ClusterFirst",
      labels: {},
      containers: [],
    });
  },

  emptyContainer(params) {
    return this.get('store').createRecord({
      type: 'container',
      tty: true,
      stdin: true,
      privileged: false,
      allowPrivilegeEscalation: false,
      readOnly: false,
      runAsNonRoot: false,
      namespaceId : this.getNamespaceId(params),
      resources: {
        cpu: {},
        memory: {},
        nvidiaGPU: {},
      },
      pullPolicy: 'Always',
    });
  },

  resetController(controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('namespaceId', null);
      controller.set('workloadId', null);
      controller.set('podId', null);
      controller.set('containerName', null);
      controller.set('upgrade', null);
      controller.set('addSidekick', null);
    }
  }
});
