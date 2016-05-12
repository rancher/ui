import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import SelectTab from 'ui/mixins/select-tab';
import { debouncedObserver } from 'ui/utils/debounce';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Ember.Component.extend(NewOrEdit, SelectTab, {
  intl: Ember.inject.service(),

  isStandalone: true,
  isService: false,
  isSidekick: false,
  isUpgrade: false,
  primaryResource: null,
  primaryService: null,
  launchConfig: null,
  service: null,
  allHosts: null,
  allServices: null,
  allStoragePools: null,

  serviceLinksArray: null,
  isGlobal: null,
  isRequestedHost: null,
  portsAsStrArray: null,
  launchConfigIndex: -1,
  upgradeOptions: null,

  // Errors from components
  commandErrors: null,
  volumeErrors: null,
  networkingErrors: null,
  healthCheckErrors: null,
  schedulingErrors: null,
  securityErrors: null,
  scaleErrors: null,
  imageErrors: null,
  portErrors: null,
  diskErrors: null,

  actions: {
    selectLaunchConfig(index) {
      this.set('launchConfigIndex', index);
      if ( this.$() )
      {
        this.$().children('[data-launchindex]').addClass('hide');
        var body = this.$().children('[data-launchindex="'+index+'"]')[0];
        if ( body )
        {
          $(body).removeClass('hide');
          $("INPUT[type='text']", body)[0].focus();
        }
      }
    },

    addSidekick(vm) {
      var ary = this.get('service.secondaryLaunchConfigs');
      ary.pushObject(this.get('store').createRecord({
        type: 'secondaryLaunchConfig',
        kind: (vm === true ? 'virtualMachine' : 'container'),
        tty: true,
        stdinOpen: true,
        restartPolicy: {name: 'always'},
        labels: { [C.LABEL.PULL_IMAGE]: C.LABEL.PULL_IMAGE_VALUE },
        uiId: Util.randomStr(),
      }));

      // Wait for it to be added to the DOM...
      Ember.run.next(() => {
        this.send('selectLaunchConfig', ary.get('length')-1);
      });
    },

    removeSidekick() {
      var idx = this.get('launchConfigIndex');
      var ary = this.get('service.secondaryLaunchConfigs');
      ary.removeAt(idx);
      if ( idx >= ary.get('length') )
      {
        Ember.run.next(() => {
          this.send('selectLaunchConfig', ary.get('length')-1);
        });
      }
    },

    setScale(scale) {
      this.set('service.scale', scale);
    },

    setImage(uuid) {
      this.set('launchConfig.imageUuid', uuid);
    },

    setLabels(section,labels) {
      this.set(section+'Labels', labels);
    },

    setRequestedHostId(hostId) {
      this.set('launchConfig.requestedHostId', hostId);
    },

    setGlobal(bool) {
      this.set('isGlobal', bool);
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
  },

  didInitAttrs() {
    this.labelsChanged();
  },

  didInsertElement() {
    if ( this.get('isVm') )
    {
      this.send('selectTab','disks');
    }
    else
    {
      this.send('selectTab','command');
    }

    this.$("INPUT[type='text']")[0].focus();
  },

  hasSidekicks: function() {
    return this.get('service.secondaryLaunchConfigs.length') > 0;
  }.property('service.secondaryLaunchConfigs.length'),

  activeLaunchConfig: function() {
    var idx = this.get('launchConfigIndex');
    if( idx === -1 )
    {
      return this.get('launchConfig');
    }
    else
    {
      return this.get('service.secondaryLaunchConfigs').objectAt(idx);
    }
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
        enabled: !isUpgrade 
      });
    });

    return out;
  }.property('service.name','service.secondaryLaunchConfigs.@each.name','intl._locale'),

  noLaunchConfigsEnabled: function() {
    return this.get('launchConfigChoices').filterBy('enabled',true).get('length') === 0;
  }.property('launchConfigChoices.@each.enabled'),

  activeLabel: function() {
    var idx = this.get('launchConfigIndex');
    var str = '';

    if ( this.get('hasSidekicks') )
    {
      if ( idx === -1 )
      {
        str = 'Primary Service: ';
      }
      else
      {
        str += 'Sidekick Service: ';
      }
    }

    if ( idx === -1 )
    {
      if ( this.get('service.name') )
      {
        str += this.get('service.name');
      }
      else
      {
        str += '(No name)';
      }
    }
    else
    {
      if ( this.get('activeLaunchConfig.name') )
      {
        str += this.get('activeLaunchConfig.name');
      }
      else
      {
        str += '(Sidekick #' + (idx+1) + ')';
      }
    }

    return str;
  }.property('service.name','activeLaunchConfig.name','launchConfigIndex','hasSidekicks'),

  // ----------------------------------
  // Labels
  // ----------------------------------
  userLabels: null,
  scaleLabels: null,
  imageLabels: null,
  commandLabels: null,
  schedulingLabels: null,
  networkingLabels: null,

  labelsChanged: debouncedObserver(
    'userLabels.@each.{key,value}',
    'scaleLabels.@each.{key,value}',
    'imageLabels.@each.{key,value}',
    'commandLabels.@each.{key,value}',
    'schedulingLabels.@each.{key,value}',
    'networkingLabels.@each.{key,value}',
    function() {
      var out = {};

      function flatten(row) {
        if ( row.value === undefined )
        {
          delete out[row.key];
        }
        else
        {
          out[row.key] = row.value;
        }
      }

      (this.get('userLabels')||[]).forEach(flatten);
      (this.get('scaleLabels')||[]).forEach(flatten);
      (this.get('imageLabels')||[]).forEach(flatten);
      (this.get('commandLabels')||[]).forEach(flatten);
      (this.get('schedulingLabels')||[]).forEach(flatten);
      (this.get('networkingLabels')||[]).forEach(flatten);

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
    this._super();
    var errors = this.get('errors')||[];

    if ( this.get('isService') )
    {
      (this.get('service.secondaryLaunchConfigs')||[]).forEach((slc) => {
        slc.validationErrors().forEach((err) => {
          errors.push(slc.get('displayName') + ': ' + err);
        });
      });
    }

    if ( errors.get('length') )
    {
      this.set('errors', errors);
      return false;
    }

    this.set('errors', null);
    return true;
  },
  willSave() {
    var errors = [];
    if ( !this.get('editing') )
    {
      // Errors from components
      errors.pushObjects(this.get('commandErrors')||[]);
      errors.pushObjects(this.get('volumeErrors')||[]);
      errors.pushObjects(this.get('networkingErrors')||[]);
      errors.pushObjects(this.get('healthCheckErrors')||[]);
      errors.pushObjects(this.get('schedulingErrors')||[]);
      errors.pushObjects(this.get('securityErrors')||[]);
      errors.pushObjects(this.get('scaleErrors')||[]);
      errors.pushObjects(this.get('imageErrors')||[]);
      errors.pushObjects(this.get('portErrors')||[]);
      errors.pushObjects(this.get('diskErrors')||[]);

      if ( errors.length )
      {
        this.set('errors', errors);
        return false;
      }
    }

    return this._super.apply(this,arguments);
  },

  doSave() {
    if ( this.get('isService') && this.get('isUpgrade') )
    {
      var choices = this.get('launchConfigChoices');
      var primary = null;
      var slc = [];
      var secondaries = this.get('service.secondaryLaunchConfigs');

      choices.filterBy('enabled',true).forEach((choice) => {
        if ( choice.index === -1 )
        {
          primary = this.get('service.launchConfig');
        }
        else
        {
          slc.push(secondaries.objectAt(choice.index).serialize());
        }
      });

      return this.get('service').doAction('upgrade', {
        inServiceStrategy: {
          batchSize: this.get('upgradeOptions.batchSize'),
          intervalMillis: this.get('upgradeOptions.intervalMillis'),
          startFirst: this.get('upgradeOptions.startFirst'),
          launchConfig: primary,
          secondaryLaunchConfigs: slc
        },
      });
    }
    else
    {
      return this._super.apply(this,arguments);
    }
  },

  didSave() {
    if ( this.get('isService') )
    {
      // Returns a promise
      return this.setServiceLinks();
    }
  },

  setServiceLinks() {
    var service = this.get('service');
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
});
