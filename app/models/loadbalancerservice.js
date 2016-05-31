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
    let portsTranslation = intl.findTranslationByKey('generic.ports');
    let internalTranslation = intl.findTranslationByKey('generic.internal');
    portsTranslation = intl.formatMessage(portsTranslation);
    internalTranslation = intl.formatMessage(internalTranslation);

    var out = (pub      ? ' <label>'+portsTranslation+': </label>'   + pub : '') +
              (internal ? '<label>'+internalTranslation+': </label>' + internal : '');

    return out.htmlSafe();
  }.property('launchConfig.ports.[]','launchConfig.expose.[]','endpointsMap', 'intl._locale'),

  displayDetail: function() {
    var services = '';
    (this.get('consumedServicesWithNames')||[]).forEach((map, idx) => {
      services += '<span>'+ (idx === 0 ? '' : ', ') +
      (map.get('service.environmentId') === this.get('environmentId') ? '' : esc(map.get('service.displayEnvironment')) + '/') +
      esc(map.get('service.displayName')) + '</span>';
    });

    let intl = this.get('intl');
    let toTranslation = intl.findTranslationByKey('generic.to');
    toTranslation = intl.formatMessage(toTranslation);

    var out = '<label>'+toTranslation+': </label>' + services;

    return out.htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}','consumedServicesUpdated', 'intl._locale'),
});

export default LoadBalancerService;
