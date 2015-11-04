import Service from 'ui/models/service';
import Ember from 'ember';

const esc = Ember.Handlebars.Utils.escapeExpression;

function portToStr(port) {
  var parts = port.match(/^(\d+)(:(\d+))?(\/(.*))?$/);
  var str;
  if ( parts )
  {
    str = parts[1] + (parts[4] ||'');
  }
  else
  {
    str = port;
  }

  return str;
}

var LoadBalancerService = Service.extend({
  type: 'loadBalancerService',

  displayDetail: function() {
    var internal = '';
    (this.get('launchConfig.expose')||[]).forEach((port) => {
      internal += '<span class="badge badge-default">' + esc(portToStr(port)) + '</span>';
    });

    var pub = '';
    (this.get('launchConfig.ports')||[]).forEach((port) => {
      pub += '<span class="badge badge-default">' + esc(portToStr(port)) + '</span>';
    });

    var services = '';
    (this.get('consumedServicesWithNames')||[]).forEach((map) => {
      services += '<span class="badge badge-default">' + map.get('service.displayName') + '</span>';
    });


    var out = (internal ? '<b>Internal: </b>' + internal : '') +
              (pub      ? ' <b>Public: </b>'   + pub : '') +
              ' <b>To: </b>' + services;

    return out.htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}','consumedServicesUpdated','launchConfig.ports.[]','launchConfig.expose.[]'),
});

export default LoadBalancerService;
