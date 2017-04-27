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

    var internal = '';
    (this.get('launchConfig.expose')||[]).forEach((portSpec, idx) => {
      internal += '<span>' + (idx === 0 ? '' : ', ') + esc(portToStr(portSpec)) + '</span>';
    });

    var pub = '';
    var fqdn = this.get('fqdn');
    let ports = (this.get('launchConfig.ports')||[]);
    ports.forEach((portSpec, idx) => {
      var portNum = specToPort(portSpec);
      var endpoints = this.get('endpointsMap')[portNum];
      if ( endpoints )
      {
        var url = Util.constructUrl((sslPorts.indexOf(portNum) >= 0), fqdn||endpoints[0], portNum);
        pub += '<span>' +
        '<a href="'+ url +'" target="_blank">' +
        esc(portToStr(portSpec)) +
        '</a>' + (idx+1 === ports.length ? '' : ', ') +
        '</span>';
      }
      else
      {
        pub += '<span>' + (idx === 0 ? '' : ', ') + esc(portToStr(portSpec)) + '</span>';
      }
    });

    let intl = this.get('intl');
    let portsTranslation = intl.t('generic.ports');
    let internalTranslation = intl.t('generic.internal');

    var out = (pub      ? ' <label>'+portsTranslation+': </label>'   + pub : '') +
              (internal ? '<label>'+internalTranslation+': </label>' + internal : '');

    return out.htmlSafe();
  }.property('launchConfig.ports.[]','launchConfig.expose.[]','endpointsMap', 'intl._locale'),

  displayDetail: function() {
    var services = (this.get('lbConfig.portRules')||[]).map((rule) => {
      if ( rule.get('selector') ) {
        return rule.get('selector');
      } else {

        let out = '';
        if ( rule.get('service.stackId') !== this.get('stackId') ) {
          out += esc(rule.get('service.displayStack'))+'/';
        }

        return out + esc(rule.get('service.displayName'));
      }
    }).uniq();

    services.sort();

    let str = '<span>' + services.join('</span><span>') + '</span>';

    let intl = this.get('intl');
    var out = '<label>'+ intl.t('generic.to')+': </label>' + str;

    return out.htmlSafe();
  }.property('lbConfig.portRules.@each.{service,selector}', 'intl._locale'),

  imageUpgradeAvailable: function() {
    let cur = (this.get('launchConfig.imageUuid')||'').replace(/^docker:/,'');
    let available = this.get(`settings.${C.SETTING.BALANCER_IMAGE}`);
    return cur.indexOf(available) === -1 && !!this.get('actionLinks.upgrade');
  }.property('launchConfig.imageUuid',`settings.${C.SETTING.BALANCER_IMAGE}`,'actionLinks.upgrade'),
});

export default LoadBalancerService;
