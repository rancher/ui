import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import SelectTab from 'ui/mixins/select-tab';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Component.extend(NewOrEdit, SelectTab, {
  isStandalone: true,
  isService: false,
  isSidekick: false,
  primaryResource: null,
  launchConfig: null,
  service: null,
  allHosts: null,
  allServices: null,

  serviceLinksArray: null,
  isGlobal: null,
  isRequestedHost: null,
  portsAsStrArray: null,
  launchConfigIndex: -1,

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

  actions: {
    selectLaunchConfig(index) {
      this.set('launchConfigIndex', index);
      Ember.run.next(() => {
        this.$().children('[data-launchindex]').addClass('hide');
        this.$().children('[data-launchindex="'+index+'"]').removeClass('hide');
      });
    },

    addSidekick() {
      var ary = this.get('service.secondaryLaunchConfigs');
      ary.pushObject(this.get('store').createRecord({
        type: 'secondaryLaunchConfig',
        tty: true,
        stdinOpen: true,
        restartPolicy: {name: 'always'},
      }));
      this.send('selectLaunchConfig', ary.get('length')-1);
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

    toggleAdvanced() {
      this.set('advanced', !this.get('advanced'));
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
    this.send('selectTab','command');
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

  // ----------------------------------
  // Labels
  // ----------------------------------
  userLabels: null,
  scaleLabels: null,
  schedulingLabels: null,

  labelsChanged: debouncedObserver(
    'userLabels.@each.{key,value}',
    'scaleLabels.@each.{key,value}',
    'schedulingLabels.@each.{key,value}',
    function() {
      var out = {};

      (this.get('userLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('scaleLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('schedulingLabels')||[]).forEach((row) => { out[row.key] = row.value; });

      var config = this.get('launchConfig');
      if ( config )
      {
        this.set('launchConfig.labels', out);
      }
    }
  ),

  // ----------------------------------
  // Save
  // ----------------------------------
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

      if ( errors.length )
      {
        this.set('errors', errors);
        return false;
      }
    }

    return this._super.apply(this,arguments);
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
