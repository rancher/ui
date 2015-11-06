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
    var first = true;
    (this.get('launchConfig.expose')||[]).forEach((port) => {
      internal += '<span class="badge badge-default'+ (first ? '' : ' r-ml5') +'">' + esc(portToStr(port)) + '</span>';
      first = false;
    });

    var pub = '';
    first = true;
    (this.get('launchConfig.ports')||[]).forEach((port) => {
      pub += '<span class="badge badge-default'+ (first ? '' : ' r-ml5') +'">' + esc(portToStr(port)) + '</span>';
      first = false;
    });

    var services = '';
    first = true;
    (this.get('consumedServicesWithNames')||[]).forEach((map) => {
      services += '<span class="badge badge-default'+ (first ? '' : ' r-ml5') +'">' + map.get('service.displayName') + '</span>';
      first = false;
    });


    var out = (internal ? '<b>Internal: </b>' + internal : '') +
              (pub      ? ' <b>Public: </b>'   + pub : '') +
              ' <b>To: </b>' + services;

    return out.htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}','consumedServicesUpdated','launchConfig.ports.[]','launchConfig.expose.[]'),
});

export default LoadBalancerService;
