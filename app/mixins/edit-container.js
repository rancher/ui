import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Mixin.create(NewOrEdit, {
  queryParams: ['tab','hostId','advanced'],
  tab: 'command',
  hostId: null,
  advanced: false,

  primaryResource: Ember.computed.alias('model.instance'),
  labelResource: Ember.computed.alias('model.instance'),

  isGlobal: null,
  isService: null,
  isRequestedHost: null,
  portsAsStrArray: null,

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
    toggleAdvanced: function() {
      this.set('advanced', !this.get('advanced'));
    },

    setLabels(section,labels) {
      this.set(section+'Labels', labels);
    },

    setRequestedHostId(hostId) {
      console.log('set requestedHostId=',hostId);
      this.set('model.instance.requestedHostId', hostId);
    },

    setGlobal(bool) {
      console.log('setGlobal',bool);
      this.set('isGlobal', bool);
    },
  },

  // ----------------------------------
  // Setup
  // ----------------------------------
  initFields: function() {
    this._super();
    this.initLabels();
  },

  // ----------------------------------
  // Labels
  // ----------------------------------
  userLabels: null,
  scaleLabels: null,
  schedulingLabels: null,
  initLabels: function() {
    this.labelsChanged();
  },

  labelsChanged: debouncedObserver(
    'userLabels.@each.{key,value}',
    'scaleLabels.@each.{key,value}',
    'schedulingLabels.@each.{key,value}',
    function() {
      var out = {};

      (this.get('userLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('scaleLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('schedulingLabels')||[]).forEach((row) => { out[row.key] = row.value; });

      if ( this.get('labelResource') )
      {
        console.log('set',out);
        this.set('labelResource.labels', out);
      }
    }
  ),

  // ----------------------------------
  // Save
  // ----------------------------------
  willSave: function() {
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

    return this._super();
  },
});
