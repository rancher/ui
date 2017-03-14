import Service from 'ui/models/service';
import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { parsePortSpec } from 'ui/utils/parse-port';

const esc = Ember.Handlebars.Utils.escapeExpression;

function portToStr(spec) {
  var parts = parsePortSpec(spec);
  return parts.host + (parts.protocol === 'http' ? '' : '/' + parts.protocol);
}

function specToPort(spec) {
  var parts = parsePortSpec(spec);
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
      if ( !spec.hostPort || spec.hostIp ) {
        this.set('hasUnsupportedPorts', true);
      }

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

  sslPorts: function() {
    let out = (this.get('lbConfig.portRules')||[]).filterBy('isTls',true).map((x) => x.get('sourcePort')).uniq();
    return out;
  }.property(`lbConfig.portRules.@each.{isTls,sourcePort}`),

  endpointsByPort: function() {
    var sslPorts = this.get('sslPorts');

    return this._super().map((obj) => {
      obj.ssl = sslPorts.indexOf(obj.port) >= 0;
      return obj;
    });
  }.property('endpointsMap'),

  displayPorts: function() {
    var sslPorts = this.get('sslPorts');
    var pieces = [];

    var fqdn = this.get('fqdn');
    let ports = (this.get('launchConfig.ports')||[]);
    ports.forEach((portSpec, idx) => {
      var portNum = specToPort(portSpec);
      var endpoints = this.get('endpointsMap')[portNum];
      if ( endpoints )
      {
        var url = Util.constructUrl((sslPorts.indexOf(portNum) >= 0), fqdn||endpoints[0], portNum);
        pieces.push('<span>' +
        '<a href="'+ url +'" target="_blank" rel="nofollow noopener">' +
        esc(portToStr(portSpec)) +
        '</a>' + (idx+1 === ports.length ? '' : ', ') +
        '</span>');
      }
      else
      {
        pieces.push('<span>' + (idx === 0 ? '' : ', ') + esc(portToStr(portSpec)) + '</span>');
      }
    });

    (this.get('launchConfig.expose')||[]).forEach((portSpec, idx) => {
      pieces.push('<span>' + (idx === 0 ? '' : ', ') + esc(portToStr(portSpec)) + '</span>');
    });

    return pieces.join(', ').htmlSafe();
  }.property('launchConfig.ports.[]','launchConfig.expose.[]','endpointsMap', 'intl._locale'),

  imageUpgradeAvailable: function() {
    let cur = (this.get('launchConfig.imageUuid')||'').replace(/^docker:/,'');
    let available = this.get(`settings.${C.SETTING.BALANCER_IMAGE}`);
    return cur !== available && !!this.get('actionLinks.upgrade');
  }.property('launchConfig.imageUuid',`settings.${C.SETTING.BALANCER_IMAGE}`,'actionLinks.upgrade'),
});

export default LoadBalancerService;
