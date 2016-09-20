import Ember from 'ember';
import SelectTab from 'ui/mixins/select-tab';
import { debouncedObserver } from 'ui/utils/debounce';
import NewBalancer from 'ui/mixins/new-balancer';

export default Ember.Component.extend(NewBalancer, SelectTab, {
  settings                  : Ember.inject.service(),

  isStandalone              : true,
  service                   : null,
  existing                  : null,
  balancerConfig            : null,
  haproxyConfig             : null,
  allHosts                  : null,
  allServices               : null,
  allCertificates           : null,

  listenersArray            : null,
  targetResources           : null,
  targetsArray              : null,
  serviceLinksArray         : null,
  isGlobal                  : null,
  isRequestedHost           : null,
  portsAsStrArray           : null,

  // Errors from components
  schedulingErrors          : null,
  scaleErrors               : null,
  portErrors                : null,

  primaryResource           : Ember.computed.alias('service'),
  launchConfig              : Ember.computed.alias('service.launchConfig'),

  init() {
    this._super(...arguments);

    this.labelsChanged();
  },

  actions: {
    cancel() {
      this.sendAction('cancel');
    },
  },

  didInsertElement() {
    this.send('selectTab','ssl');
    this.$('INPUT')[0].focus();
  },


  // ----------------------------------
  // Labels
  // ----------------------------------
  userLabels: null,
  scaleLabels: null,
  schedulingLabels: null,
  sslLabels: null,

  labelsChanged: debouncedObserver(
    'userLabels.@each.{key,value}',
    'scaleLabels.@each.{key,value}',
    'schedulingLabels.@each.{key,value}',
    'sslLabels.@each.{key,value}',
    function() {
      var out = {};

      (this.get('userLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('scaleLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('schedulingLabels')||[]).forEach((row) => { out[row.key] = row.value; });
      (this.get('sslLabels')||[]).forEach((row) => { out[row.key] = row.value; });

      var config = this.get('launchConfig');
      if ( config )
      {
        this.set('launchConfig.labels', out);
      }
    }
  ),

});
