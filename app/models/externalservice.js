import Service from 'ui/models/service';

var ExternalService = Service.extend({
  type: 'externalService',

  healthState: function() {
    return 'healthy';
  }.property(),

  displayTargets: function() {
    let hostname = this.get('hostname');
    if ( hostname ) {
      return hostname;
    }

    return (this.get('externalIpAddresses')||[]).join(', ');
  }.property('hostname','externalIpAddresses')
});

export default ExternalService;
