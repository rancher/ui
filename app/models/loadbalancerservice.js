import { inject as service } from '@ember/service';
import Service from 'ui/models/service';
import C from 'ui/utils/constants';
import { parsePortSpec } from 'ui/utils/parse-port';

var LoadBalancerService = Service.extend({
  type: 'loadBalancerService',

  intl: service(),
  settings: service(),

  initPorts() {
    let rules = this.get('lbConfig.portRules')||[];
    let publish = this.get('launchConfig.ports')||[];
    publish.forEach((str) => {
      let spec = parsePortSpec(str,'tcp');
      if ( spec.hostPort ) {
        rules.filterBy('sourcePort', spec.hostPort).forEach((rule) => {
          rule.set('access', 'public');
        });
      }
    });


    rules.forEach((rule) => {
      if ( !rule.get('access') ) {
        rule.set('access', 'internal');
      }
    });
  },

  tlsPorts: function() {
    let out = (this.get('lbConfig.portRules')||[]).filterBy('isTls',true).map((x) => parseInt(x.get('sourcePort'),10)).uniq();
    return out;
  }.property(`lbConfig.portRules.@each.{isTls,sourcePort}`),

  endpointsMap: function() {
    var tlsPorts = this.get('tlsPorts');

    // Set `tls` on each endpoint since we know it from balancer listener context
    (this.get('publicEndpoints')||[]).forEach((endpoint) => {
      endpoint.set('tls', tlsPorts.includes(endpoint.publicPort));
    });

    return this._super(...arguments);
  }.property('publicEndpoints.@each.{ipAddress,publicPort}','tlsPorts.[]'),

  imageUpgradeAvailable: function() {
    let cur = this.get('launchConfig.image')||'';
    let available = this.get(`settings.${C.SETTING.BALANCER_IMAGE}`);
    return cur.indexOf(available) === -1 && !!this.get('actionLinks.upgrade');
  }.property('launchConfig.image',`settings.${C.SETTING.BALANCER_IMAGE}`,'actionLinks.upgrade'),
});

export default LoadBalancerService;
