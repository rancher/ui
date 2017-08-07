import Ember from 'ember';

export default Ember.Controller.extend({
  service:            Ember.computed.alias('model.service'),
  stack:              Ember.computed.alias('model.stack'),
  application:        Ember.inject.controller(),
  rules:              Ember.computed.alias('service.lbConfig.portRules'),
  sortBy:             'priority',
  fixedLaunchConfig:  null,
  activeLaunchConfig: null,
  portSortBy:         'privatePort',
  headers: [
    {
      name:           'priority',
      sort:           ['priority'],
      translationKey: 'formBalancerRules.priority.label',
      width:          85,
    },
    {
      name:           'access',
      sort:           ['access'],
      translationKey: 'formBalancerRules.access.label',
      width:          85,
    },
    {
      name:           'protocol',
      sort:           ['protocol'],
      translationKey: 'formBalancerRules.protocol.label',
      width:          95
    },
    {
      name:           'hostname',
      sort:           ['hostname'],
      translationKey: 'formBalancerRules.hostname.label',
    },
    {
      name:           'sourcePort',
      sort:           ['sourcePort'],
      translationKey: 'formBalancerRules.sourcePort.label',
      width:          145
    },
    {
      name:           'path',
      sort:           ['path'],
      translationKey: 'formBalancerRules.path.label',
    },
    {
      name:           'target',
      translationKey: 'formBalancerRules.target',
    },
    {
      name:           'targetPort',
      sort:           ['targetPort'],
      translationKey: 'formBalancerRules.targetPort.label',
      width:          80
    },
    {
      name:           'backendName',
      sort:           ['backendName'],
      translationKey: 'formBalancerRules.backendName.label',
    },
  ],
  portHeaders: [
    {
      name:           'publicIp',
      sort:           ['ipAddress'],
      searchField:    'ipAddress',
      translationKey: 'generic.ipAddress',
    },
    {
      name:           'publicPort',
      sort:           ['port'],
      searchField:    'port',
      translationKey: 'containerPage.portsTab.table.public',
    },
  ],

  actions: {
    selectMaster() {
      this.set('activeLaunchConfig', this.get('fixedLaunchConfig'));
    },
    selectSidekick(idx) {
      let service = this.get('model.service');
      let configs = service.get('secondaryLaunchConfigs');

      this.set('activeLaunchConfig', configs[idx]);
    },
    changeService(service) {
      var transitionTo = this.get('application.currentRouteName');

      if (service.type === 'dnsService') {
        transitionTo = 'service.links';
      }

      this.transitionToRoute(transitionTo, service.get('id'));
    }
  },
});
