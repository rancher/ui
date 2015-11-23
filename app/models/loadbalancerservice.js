import Service from 'ui/models/service';
import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

const esc = Ember.Handlebars.Utils.escapeExpression;

function portToStr(spec) {
  var parts = spec.match(/^(\d+)(:(\d+))?(\/(.*))?$/);
  var str;
  if ( parts )
  {
    str = parts[1] + (parts[4] ||'');
  }
  else
  {
    str = spec;
  }

  return str;
}

function specToPort(spec) {
  var parts = spec.match(/^(\d+)(:(\d+))?(\/(.*))?$/);
  var str;
  if ( parts )
  {
    str = parts[1];
  }
  else
  {
    str = spec;
  }

  return parseInt(str,10);
}

var LoadBalancerService = Service.extend({
  type: 'loadBalancerService',

  displayPorts: function() {
    var sslPorts = (((this.get('launchConfig.labels')||{})[C.LABEL.BALANCER_SSL_PORTS]||'')).split(',');

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
        var url = Util.constructUrl(sslPorts[portNum], fqdn||endpoints[0], portNum);
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

    var out = (pub      ? ' <label>Ports: </label>'   + pub : '') +
              (internal ? '<label>Internal: </label>' + internal : '');

    return out.htmlSafe();
  }.property('launchConfig.ports.[]','launchConfig.expose.[]','endpointsMap'),

  displayDetail: function() {
    var services = '';
    (this.get('consumedServicesWithNames')||[]).forEach((map, idx) => {
      services += '<span>'+ (idx === 0 ? '' : ', ') + map.get('service.displayName') + '</span>';
    });

    var out = '<label>To: </label>' + services;

    return out.htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}','consumedServicesUpdated'),
});

export default LoadBalancerService;
