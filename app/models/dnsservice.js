import Ember from 'ember';
import Service from 'ui/models/service';

const esc = Ember.Handlebars.Utils.escapeExpression;

var DnsService = Service.extend({
  type: 'dnsService',

  healthState: function() {
    return 'healthy';
  }.property(),

  displayDetail: function() {
    var out = '';
    this.get('consumedServicesWithNames').forEach((map) => {
      var part = '<span class="badge badge-default">';
      if ( map.get('name') )
      {
        part += esc(map.get('name')) + ": ";
      }

      part += map.get('service.displayName') + '</span>';
      out += part;
    });
    return ('<b>To: </b>' + out).htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}','consumedServicesUpdated'),
});

export default DnsService;
