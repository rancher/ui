import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import SelectTab from 'ui/mixins/select-tab';
import { debouncedObserver } from 'ui/utils/debounce';
import C from 'ui/utils/constants';
import { flattenLabelArrays } from 'ui/mixins/manage-labels';
import Util from 'ui/utils/util';

export default Ember.Component.extend(NewOrEdit, SelectTab, {
  intl                      : Ember.inject.service(),
  settings                  : Ember.inject.service(),

  tagName: 'form',

  isService:                  false,
  isUpgrade:                  false,
  service:                    null,
  launchConfig:               null,
  launchConfigIndex:          null,

  stack:                      null,
  scale:                      1,

  serviceLinksArray:          null,
  isRequestedHost:            null,
  portsAsStrArray:            null,
  upgradeOptions:             null,

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

    if ( this.get('isService') ) {
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
  // Sidekicks
  // ----------------------------------

  isSidekick: function() {
    let idx = this.get('launchConfigIndex');
    return idx !== null && idx !== -1;
  }.property('launchConfigIndex'),

  launchConfigChoices: function() {
    var isUpgrade = this.get('isUpgrade');
    let intl = this.get('intl');

    // Enabled is only for upgrade, and isn't maintained if the names change, but they can't on upgrade.
    var out = [
      {
        index: -1,
        name: this.get('service.name') || intl.t('newContainer.emptyPrimaryService'),
        enabled: true
      }
    ];

    (this.get('service.secondaryLaunchConfigs')||[]).forEach((item, index) => {
      out.push({
        index: index,
        name: item.get('name') || intl.t('newContainer.emptySidekick', {num: index+1}),
        enabled: !isUpgrade,
        uiId: item.get('uiId'),
      });
    });

    return out;
  }.property('service.name','service.secondaryLaunchConfigs.@each.name','intl.locale'),

  noLaunchConfigsEnabled: function() {
    return this.get('launchConfigChoices').filterBy('enabled',true).get('length') === 0;
  }.property('launchConfigChoices.@each.enabled'),

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
    let errors = [];

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
    let ok = this._super(...arguments);
    if ( !ok ) {
      return ok;
    }

    let pr;
    let lc = this.get('launchConfig').clone();

    if ( this.get('isService') ) {
      // Apply the launch config to the service
      pr = this.get('service').clone();
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
    }

    pr.setProperties({
      name: this.get('name'),
      description: this.get('description'),
    });

    this.set('primaryResource', pr);
    this.set('originalPrimaryResource', pr);

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
    if ( this.get('isService') ) {
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
    this.sendAction('done');
  },

  headerToken: function() {
    let k = 'newContainer.';
    k += (this.get('isUpgrade') ? 'upgrade' : 'add') + '.';
    if ( this.get('isSidekick') ) {
      k += 'sidekick';
    } else if ( this.get('isService') ) {
      k += 'scalingGroup';
    } else {
      k += 'container';
    }

    return k;
  }.property('isUpgrade','isService'),

  supportsSecrets: function() {
    return !!this.get('store').getById('schema','secret');
  }.property(),
});
