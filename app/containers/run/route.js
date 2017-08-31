import Ember from 'ember';
import C from 'ui/utils/constants';

export const EMPTY_LC = JSON.stringify({
  type: 'launchConfig',
  tty: true,
  stdinOpen: true,
  labels: { [C.LABEL.PULL_IMAGE]: C.LABEL.PULL_IMAGE_VALUE },
  restartPolicy: {name: 'always'},
});

export default Ember.Route.extend({
  prefs: Ember.inject.service(),

  queryParams: {
    launchConfigIndex: {
      refreshModel: true
    }
  },

  model: function(params/*, transition*/) {
    var store = this.get('store');
    let lcIndex = params.launchConfigIndex;
    if ( lcIndex ) {
      lcIndex = parseInt(lcIndex,10);
    }

    let defaultStack = null;
    if ( params.stackId ) {
      defaultStack = store.getById('stack', params.stackId); 
    }

    if ( !defaultStack ) {
      defaultStack = store.getById('stack', this.get(`prefs.${C.PREFS.LAST_STACK}`));
    }

    let stackId = null;
    if ( defaultStack ) {
      stackId = defaultStack.get('id');
    }

    let emptyService = store.createRecord({
      type: 'scalingGroup', // @TODO switch back to service
      stackId: stackId,
      scale: 1,
    });

    let emptyLc = store.createRecord(JSON.parse(EMPTY_LC));
    emptyLc.stackId = stackId;

    var dependencies = {};
    if ( params.serviceId )
    {
      dependencies['service'] = store.find('service', params.serviceId);
    }
    else if ( params.containerId )
    {
      dependencies['container'] = store.find('container', params.containerId);
    }

    return Ember.RSVP.hash(dependencies, 'Load dependencies').then((results) => {
      if ( results.hasOwnProperty('service') ) {
        // Service Upgrade/Clone
        let service = results.service;
        if ( !service ) {
          return Ember.RVP.reject('Service not found');
        }

        let clone = service.clone();

        if ( params.addSidekick ) {
          return Ember.Object.create({
            mode: 'sidekick',
            service: clone,
            launchConfig: emptyLc,
            isService: true,
            isUpgrade: false,
          });
        } else if ( lcIndex === null ) {
          // If there are sidekicks, you need to pick one & come back
          if ( service.secondaryLaunchConfigs && service.secondaryLaunchConfigs.length ) {
            return Ember.Object.create({
              service: service,
              selectLaunchConfig: true,
            });
          } else {
            // Otherwise use primary
            lcIndex = -1;
          }
        }

        let lc;
        if ( lcIndex === -1 ) {
          // Primary service
          lc = clone.launchConfig;
        } else {
          // Existing sidekick
          lc = clone.secondaryLaunchConfigs[lcIndex];
        }

        if ( params.upgrade) {
          // Upgrade service
          let out = Ember.Object.create({
            mode: 'service',
            service: clone,
            launchConfig: lc,
            launchConfigIndex: lcIndex,
            isService: true,
            isUpgrade: true
          });

          if ( lcIndex >= 0 ) {
            out.set('mode','sidekick');
          }

          return out;
        } else {
          // Clone service
          let neu = store.createRecord(clone.serializeForNew());

          return Ember.Object.create({
            mode: 'service',
            service: neu,
            launchConfig: lc,
            isService: true,
            isUpgrade: false
            // no launchConfigIndex because this will be a new service or sidekick
          });
        }
      } else if ( results.hasOwnProperty('container') ) {
        // Container Upgrade/Clone
        let container = results.container;
        if ( !container ) {
          return Ember.RVP.reject('Container not found');
        }

        let clone = container.clone();

        if ( params.upgrade) {
          emptyService.set('launchConfig', clone);
          return Ember.Object.create({
            mode: 'container',
            service: emptyService,
            launchConfig: clone,
            isService: false,
            isUpgrade: true
          });
        } else {
          let neu = store.createRecord(clone.serializeForNew());
          emptyService.set('launchConfig', neu);
          return Ember.Object.create({
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
        return Ember.Object.create({
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
      controller.set('stackId', null);
      controller.set('serviceId', null);
      controller.set('containerId', null);
      controller.set('launchConfigIndex', null);
      controller.set('upgrade', null);
      controller.set('addSidekick', null);
    }
  }
});
