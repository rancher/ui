import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import SelectTab from 'ui/mixins/select-tab';
import { debouncedObserver } from 'ui/utils/debounce';
import C from 'ui/utils/constants';
import { flattenLabelArrays } from 'ui/mixins/manage-labels';
import Util from 'ui/utils/util';

export default Ember.Component.extend(NewOrEdit, SelectTab, {
  intl: Ember.inject.service(),
  prefs: Ember.inject.service(),
  settings: Ember.inject.service(),

  tagName: 'form',

  isService:                  false,
  isUpgrade:                  false,
  service:                    null,
  launchConfig:               null,
  launchConfigIndex:          null, // null: not valid here, -1: Primary LC, 0-n: Sidekick SLCs

  stack:                      null,
  scale:                      1,
  scaleMode:                  null,

  serviceLinksArray:          null,
  isRequestedHost:            null,
  upgradeOptions:             null,
  sidekickService:            null,
  volumesToCreate:            null,

  // Errors from components
  commandErrors:              null,
  volumeErrors:               null,
  networkingErrors:           null,
  secretsErrors:              null,
  healthCheckErrors:          null,
  schedulingErrors:           null,
  securityErrors:             null,
  scaleErrors:                null,
  imageErrors:                null,
  portErrors:                 null,
  stackErrors:                null,

  actions: {
    setImage(uuid) {
      this.set('launchConfig.image', uuid);
    },

    setLabels(section,labels) {
      this.set(section+'Labels', labels);
    },

    setRequestedHostId(hostId) {
      this.set('launchConfig.requestedHostId', hostId);
    },

    setServiceLinks(links) {
      this.set('serviceLinksArray', links);
    },

    setUpgrade(upgrade) {
      this.set('upgradeOptions', upgrade);
    },

    setScaleMode(mode) {
      this.set('scaleMode', mode);
    },

    setSidekick(service) {
      this.set('sidekickService', service);
      this.set('isSidekick', service !== undefined)
    },

    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },

    addSidekick() {
      var ary = this.get('service.secondaryLaunchConfigs');
      ary.pushObject(this.get('store').createRecord({
        type: 'secondaryLaunchConfig',
        kind: 'container',
        tty: true,
        stdinOpen: true,
        restartPolicy: {name: 'always'},
        labels: { [C.LABEL.PULL_IMAGE]: C.LABEL.PULL_IMAGE_VALUE },
        uiId: Util.randomStr(),
      }));
    },

    removeSidekick(idx) {
      var ary = this.get('primaryService.secondaryLaunchConfigs');
      ary.removeAt(idx);
    },
  },

  init() {
    window.nec = this;
    this._super(...arguments);

    // Tell cattle that we're sending the whole thing, not a diff.
    this.set('service.completeLaunchConfigs', true);

    if ( !this.get('launchConfig.secrets') ) {
      this.set('launchConfig.secrets', []);
    }

    this.set('isSidekick', this.get('launchConfigIndex') >= 0);

    if ( this.get('isService') && !this.get('isSidekick') ) {
      this.setProperties({
        name: this.get('service.name'),
        description: this.get('service.description'),
        scale: this.get('service.scale'),
      });
    } else {
      this.setProperties({
        name: this.get('launchConfig.name'),
        description: this.get('launchConfig.description'),
      });
    }

    let stackId = null;
    if ( this.get('isService') ) {
      stackId = this.get('service.stackId');
    } else {
      stackId = this.get('launchConfig.stackId');
    }

    if ( stackId ) {
      let stack = this.get('store').getById('stack', stackId);
      if ( stack ) {
        this.set('stack', stack);
      }
    }

    this.labelsChanged();
  },

  didInsertElement() {
    this.$("INPUT[type='text']")[0].focus();
  },

  // ----------------------------------
  // Labels
  // ----------------------------------
  userLabels: null,
  scaleLabels: null,
  securityLabels: null,
  commandLabels: null,
  schedulingLabels: null,
  networkingLabels: null,

  labelsChanged: debouncedObserver(
    'userLabels.@each.{key,value}',
    'scaleLabels.@each.{key,value}',
    'securityLabels.@each.{key,value}',
    'commandLabels.@each.{key,value}',
    'schedulingLabels.@each.{key,value}',
    'networkingLabels.@each.{key,value}',
    function() {
      let out = flattenLabelArrays(
        this.get('userLabels'),
        this.get('scaleLabels'),
        this.get('securityLabels'),
        this.get('commandLabels'),
        this.get('schedulingLabels'),
        this.get('networkingLabels')
      );

      var config = this.get('launchConfig');
      if ( config )
      {
        this.set('launchConfig.labels', out);
      }
    }
  ),

  // ----------------------------------
  // Disks
  // ----------------------------------
  storageDriverChoices: function() {
    return (this.get('allStoragePools')||[])
            .map((pool) => { return pool.get('driverName'); })
            .filter((name) => { return C.VM_CAPABLE_STORAGE_DRIVERS.indexOf(name) >= 0; })
            .uniq()
            .sort();
  }.property('allStoragePools.@each.driverName'),

  // ----------------------------------
  // Save
  // ----------------------------------
  validate() {
    let pr = this.get('primaryResource');
    let errors = pr.validationErrors() || [];

    if ( this.get('isService') )
    {
      (this.get('service.secondaryLaunchConfigs')||[]).forEach((slc) => {
        slc.validationErrors().forEach((err) => {
          errors.push(slc.get('displayName') + ': ' + err);
        });
      });
    }

    // Errors from components
    errors.pushObjects(this.get('commandErrors')||[]);
    errors.pushObjects(this.get('volumeErrors')||[]);
    errors.pushObjects(this.get('networkingErrors')||[]);
    errors.pushObjects(this.get('secretsErrors')||[]);
    errors.pushObjects(this.get('healthCheckErrors')||[]);
    errors.pushObjects(this.get('schedulingErrors')||[]);
    errors.pushObjects(this.get('securityErrors')||[]);
    errors.pushObjects(this.get('scaleErrors')||[]);
    errors.pushObjects(this.get('imageErrors')||[]);
    errors.pushObjects(this.get('portErrors')||[]);
    errors.pushObjects(this.get('stackErrors')||[]);


    errors = errors.uniq();

    if ( errors.get('length') )
    {
      this.set('errors', errors);
      return false;
    }

    this.set('errors', null);
    return true;
  },

  willSave() {
    let intl = this.get('intl');
    let pr;
    let nameResource;
    let lc = this.get('launchConfig').clone();
    let name = (this.get('name')||'').trim().toLowerCase();


    if ( this.get('isSidekick') ) {
      let service = this.get('sidekickService');
      let errors = [];
      if ( !service ) {
        errors.push(this.get('intl').t('newContainer.errors.noSidekick'));
        this.set('errors', errors);
        return false;
      }

      if ( !name ) {
        errors.push(intl.t('validation.required', {key: intl.t('formNameDescription.name.label')}));
        this.set('errors', errors);
        return false;
      }

      pr = service.clone();
      let def = lc.serialize();
      def.type = 'secondaryLaunchConfig';
      let sidekick = this.get('store').createRecord(def);
      nameResource = sidekick;
      let slc = pr.get('secondaryLaunchConfigs');
      if ( !slc ) {
        slc = [];
        pr.set('secondaryLaunchConfigs', slc);
      }

      let duplicate = slc.find((x, idx) => {
        return idx !== this.get('launchConfigIndex') && x.get('name').toLowerCase() === name;
      });
      if ( duplicate ) {
        errors.push(intl.t('newContainer.errors.duplicateName', {name: name, service: duplicate.get('displayName')}));
        this.set('errors', errors);
        return false;
      }

      slc.push(sidekick);
    } else if ( this.get('isService') ) {
      // Apply the launch config to the service
      pr = this.get('service').clone();
      nameResource = pr;
      let index = this.get('launchConfigIndex');
      if ( index >= 0 ) {
        let slc = pr.get('secondaryLaunchConfigs');
        if ( !slc ) {
          slc = [];
          pr.set('secondaryLaunchConfig', slc);
        }

        slc[index] = lc;
      } else {
        pr.set('launchConfig', lc);
      }

      pr.set('scale', this.get('scale'));
    } else {
      // Convert the launch config to a container
      let lc = this.get('launchConfig').serialize();
      lc.type = 'container';
      pr = this.get('store').createRecord(lc);
      pr.set('count', this.get('scale'));
      nameResource = pr;
    }

    pr.set('completeUpdate', true);

    nameResource.setProperties({
      name: this.get('name'),
      description: this.get('description'),
    });

    this.set('primaryResource', pr);
    this.set('originalPrimaryResource', pr);

    let ok = this.validate();
    return ok;
  },

  doSave() {
    let pr = this.get('primaryResource');

    let stackPromise = Ember.RSVP.resolve();
    if ( !this.get('isUpgrade') ) {
      // Set the stack ID
      if ( this.get('stack.id') ) {
        pr.set('stackId', this.get('stack.id'));
      } else if ( this.get('stack') ) {
        stackPromise = this.get('stack').save().then((newStack) => {
          pr.set('stackId', newStack.get('id'));
        });
      } else {
        // This shouldn't happen since willSave checked it...
        return Ember.RSVP.reject('No Stack');
      }
    }

    let self = this;
    let sup = self._super;

    return stackPromise.then(() => {
      let volumes = this.get('volumesToCreate');
      let volumesPromise = Ember.RSVP.resolve();

      if ( volumes && volumes.get('length') ) {
        volumesPromise = Ember.RSVP.all(volumes.map((volume) => {
          volume.set('stackId', this.get('stack.id'));
          return volume.save();
        }));
      }

      return volumesPromise.then(() => {
        if ( this.get('isUpgrade') && !this.get('isService') ) {
          // Container upgrade
          return this.get('launchConfig').doAction('upgrade', {config: this.get('launchConfig')});
        } else {
          // Container create or Service create/upgrade
          return sup.apply(self,arguments);
        }
      });
    })
  },

  doneSaving() {
    if ( !this.get('isUpgrade') ) {
      this.set(`prefs.${C.PREFS.LAST_SCALE_MODE}`, this.get('scaleMode'));
      this.set(`prefs.${C.PREFS.LAST_STACK}`, this.get('stack.id'));
    }
    this.sendAction('done');
  },

  header: '',
  updateHeader: function() {
    let args = {};
    let k = 'newContainer.';
    k += (this.get('isUpgrade') ? 'upgrade' : 'add') + '.';
    if ( this.get('isSidekick') ) {
      let svc = this.get('sidekickService');
      if ( svc ) {
        k += 'sidekickName';
        args = {name: this.get('sidekickService.displayName')};
      } else {
        k += 'sidekick';
      }
    } else if ( this.get('isGlobal') ) {
      k += 'globalService';
    } else if ( this.get('isService') ) {
      k += 'service';
    } else {
      k += 'container';
    }

    Ember.run.next(() => {
      this.set('header', this.get('intl').t(k, args));
    });
  }.observes('isUpgrade','isService','isSidekick','isGlobal','sidekickService.displayName','intl.locale').on('init'),

  supportsSecrets: function() {
    return !!this.get('store').getById('schema','secret');
  }.property(),
});
