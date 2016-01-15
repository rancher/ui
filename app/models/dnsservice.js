import Ember from 'ember';
import Service from 'ui/models/service';

const esc = Ember.Handlebars.Utils.escapeExpression;

var DnsService = Service.extend({
  type: 'dnsService',

  healthState: function() {
    return 'healthy';
  }.property(),

  displayDetail: function() {
    var services = '';
    (this.get('consumedServicesWithNames')||[]).forEach((map, idx) => {
      services += '<span>'+ (idx === 0 ? '' : ', ') +
      (map.get('service.environmentId') === this.get('environmentId') ? '' : esc(map.get('service.displayEnvironment')) + '/') +
      esc(map.get('service.displayName')) + '</span>';
    });

    var out = '<label>To: </label>' + services || '<span class="text-muted">None</span>';

    return out.htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}','consumedServicesUpdated'),
});

export default DnsService;
