import Service from 'ui/service/model';

var DnsService = Service.extend({
  type: 'dnsService',

  healthState: function() {
    return 'healthy';
  }.property(),
});

export default DnsService;
