import Service from 'ui/models/service';
import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { parsePortSpec } from 'ui/utils/parse-port';

const esc = Ember.Handlebars.Utils.escapeExpression;

function portToStr(spec) {
  var parts = parsePortSpec(spec,'http');
  return parts.host + (parts.protocol === 'http' ? '' : '/' + parts.protocol);
}

function specToPort(spec) {
  var parts = parsePortSpec(spec,'http');
  return parts.hostPort;
}

var LoadBalancerService = Service.extend({
  type: 'loadBalancerService',

  intl: Ember.inject.service(),
  settings: Ember.inject.service(),

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

    // Set `ssl` on each endpoint since we know it from balancer listener context
    (this.get('publicEndpoints')||[]).forEach((endpoint) => {
      endpoint.set('tls', tlsPorts.includes(obj.publicPort));
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
