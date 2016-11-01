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
  intl : Ember.inject.service(),

  sslPorts: function() {
    return (((this.get('launchConfig.labels')||{})[C.LABEL.BALANCER_SSL_PORTS]||'')).split(',').map((str) => {
      return parseInt(str,10);
    });
  }.property(`launchConfig.labels`),

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
    (this.get('launchConfig.ports')||[]).forEach((portSpec, idx) => {
      var portNum = specToPort(portSpec);
      var endpoints = this.get('endpointsMap')[portNum];
      if ( endpoints )
      {
        var url = Util.constructUrl((sslPorts.indexOf(portNum) >= 0), fqdn||endpoints[0], portNum);
        pub += '<span>' + (idx === 0 ? '' : ', ') +
        '<a href="'+ url +'" target="_blank">' +
        esc(portToStr(portSpec)) +
        '</a>' +
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
      let out = '';
      if ( rule.get('service.stackId') !== this.get('stackId') ) {
        out += esc(rule.get('service.displayStack'))+'/';
      }

      return out + esc(rule.get('service.displayName'));
    }).uniq();

    services.sort();

    let str = '<span>' + services.join('</span><span>') + '</span>';

    let intl = this.get('intl');
    var out = '<label>'+ intl.t('generic.to')+': </label>' + str;

    return out.htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}', 'intl._locale'),
});

export default LoadBalancerService;
