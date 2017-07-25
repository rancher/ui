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
  portsAsStrArray:            null,
  upgradeOptions:             null,
  sidekickService:            null,

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
  diskErrors:                 null,
  stackErrors:                null,

  actions: {
    setImage(uuid) {
      this.set('launchConfig.imageUuid', uuid);
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
    errors.pushObjects(this.get('diskErrors')||[]);
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

    if ( this.get('isSidekick') ) {
      let service = this.get('sidekickService');
      let errors = [];
      if ( !service ) {
        errors.push(this.get('intl').t('newContainer.errors.noSidekick'));
        this.set('errors', errors);
        return false;
      }

      let name = (this.get('name')||'').trim().toLowerCase();

      if ( !name ) {
        errors.push(intl.t('validation.required', {key: intl.t('formNameDescription.name.label')}));
        this.set('errors', errors);
        return false;
      }

      pr = service.clone();
      let sidekick = this.get('store').createRecord({}, lc.serialize(), {type: 'secondaryLaunchConfig'});
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
        errors.push(intl.t('newContainer.errors.duplicateName', {name: this.get('name'), service: duplicate.get('displayName')}));
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

    nameResource.setProperties({
      name: this.get('name'),
      description: this.get('description'),
    });

    this.set('primaryResource', pr);
    this.set('originalPrimaryResource', pr);

    let ok = this._super(...arguments);
    if ( !ok ) {
      return ok;
    }

    if ( this.get('isUpgrade') ) {
      return true;
    } else {
      pr.set('completeUpdate', true);

      // Set the stack ID
      if ( this.get('stack.id') ) {
        pr.set('stackId', this.get('stack.id'));
        return true;
      } else if ( this.get('stack') ) {
        return this.get('stack').save().then((newStack) => {
          this.set('primaryResource.stackId', newStack.get('id'));
          return true;
        });
      } else {
        return Ember.RSVP.reject('Stack is required');
      }
    }
  },

  doSave() {
    return this._super(...arguments);
  },

  didSave() {
    if ( this.get('isService') && !this.get('isSidekick') ) {
      // Returns a promise
      return this.setServiceLinks();
    }
  },

  setServiceLinks() {
    var service = this.get('primaryResource');
    var ary = [];
    this.get('serviceLinksArray').forEach((row) => {
      if ( row.serviceId )
      {
        ary.push({name: row.name, serviceId: row.serviceId});
      }
    });

    return service.doAction('setservicelinks', {serviceLinks: ary});
  },

  doneSaving() {
    if ( !this.get('isUpgrade') ) {
      this.set(`prefs.${C.PREFS.SCALE_MODE}`, this.get('scaleMode'));
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
