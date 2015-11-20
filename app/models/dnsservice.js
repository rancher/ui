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
      var part = '<span>' +  esc(map.get('service.displayName')) + '</span>';
      out += part;
    });
    return ('<span class="text-muted">To: </span>' + out).htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}','consumedServicesUpdated'),
});

export default DnsService;
