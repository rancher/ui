import Service from 'ui/models/service';

var DnsService = Service.extend({
  type: 'dnsService',

  healthState: function() {
    return 'healthy';
  }.property(),
});

export default DnsService;
