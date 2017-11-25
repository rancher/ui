import EmberObject from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import Ember from 'ember';
import C from 'ui/utils/constants';

export const EMPTY_LC = JSON.stringify({
  type: 'container',
  tty: true,
  stdin: true,
  pullPolicy: 'Always',
});

export default Route.extend({
  prefs: service(),

  queryParams: {
    containerName: {
      refreshModel: true
    }
  },

  model: function(params/*, transition*/) {
    var store = this.get('store');
    let containerName = params.containerName;

    let defaultNs = null;
    if ( params.namespaceId ) {
      defaultNs = store.getById('namespace', params.namespaceId); 
    }

    if ( !defaultNs ) {
      defaultNs = store.getById('namespace', this.get(`prefs.${C.PREFS.LAST_NAMESPACE}`));
    }

    let namespaceId = null;
    if ( defaultNs ) {
      namespaceId = defaultNs.get('id');
    }

    let emptyService = store.createRecord({
      type: 'workload',
      namespace: namespaceId,
      scale: 1,
      restart: 'Always',
    });

    let emptyLc = store.createRecord(JSON.parse(EMPTY_LC));
    emptyLc.namespaceId = namespaceId;

    var dependencies = {};
    if ( params.workloadId )
    {
      dependencies['workload'] = store.find('workload', params.workloadId);
    }
    else if ( params.containerId )
    {
      dependencies['pod'] = store.find('pod', params.podId);
    }

    return hash(dependencies, 'Load dependencies').then((results) => {
      if ( results.hasOwnProperty('workload') ) {
        // Workload Upgrade/Clone
        let workload = results.workload;
        if ( !workload ) {
          return Ember.RVP.reject('Workload not found');
        }

        let clone = workload.clone();

        if ( params.addSidekick ) {
          return EmberObject.create({
            mode: 'sidekick',
            workload: clone,
            launchConfig: emptyLc,
            isService: true,
            isUpgrade: false,
          });
        } else if ( containerName === null ) {
          // If there are sidekicks, you need to pick one & come back
          const containerNames = Object.keys(service.containers);
          if ( containerNames.length > 1 ) {
            return EmberObject.create({
              workload: workload,
              selectLaunchConfig: true,
            });
          } else {
            // Otherwise use primary
            containerName = "";
          }
        }

        let lc;
        if ( containerName === "" ) {
          // Primary service
          lc = service.containers[containerNames[0]];
        } else {
          // Existing sidekick
          lc = service.containers[containerName];
        }

        if ( params.upgrade) {
          // Upgrade service
          let out = EmberObject.create({
            mode: 'service',
            service: clone,
            launchConfig: lc,
            containerName: containerName,
            isService: true,
            isUpgrade: true
          });

          if ( containerName ) {
            out.set('mode','sidekick');
          }

          return out;
        } else {
          // Clone service
          let neu = store.createRecord(clone.serializeForNew());

          return EmberObject.create({
            mode: 'service',
            service: neu,
            launchConfig: lc,
            isService: true,
            isUpgrade: false
            // no launchConfigIndex because this will be a new service or sidekick
          });
        }
      } else if ( results.hasOwnProperty('pod') ) {
        // Container Upgrade/Clone
        let pod = results.pod;
        if ( !pod ) {
          return Ember.RVP.reject('Pod not found');
        }

        let clone = container.clone();

        if ( params.upgrade) {
          emptyService.set('launchConfig', clone);
          return EmberObject.create({
            mode: 'container',
            service: emptyService,
            launchConfig: clone,
            isService: false,
            isUpgrade: true
          });
        } else {
          let neu = store.createRecord(clone.serializeForNew());
          emptyService.set('launchConfig', neu);
          return EmberObject.create({
            mode: 'container',
            service: emptyService,
            launchConfig: neu,
            isService: false,
            isUpgrade: false,
          });
        }
      } else {
        let mode = this.get(`prefs.${C.PREFS.LAST_SCALE_MODE}`) || 'container';

        let isService = (mode && mode !== 'container');
        let isGlobal = (mode === 'global');
        if ( isGlobal ) {
          emptyLc.labels[C.LABEL.SCHED_GLOBAL] = 'true';
        }

        // New Container/Service
        emptyService.set('launchConfig', emptyLc);
        return EmberObject.create({
          mode: mode,
          service: emptyService,
          launchConfig: emptyLc,
          isService: isService,
          isUpgrade: false,
        });
      }
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
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
