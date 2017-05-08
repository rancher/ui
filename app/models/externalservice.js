import Service from 'ui/models/service';

export default Service.extend({
  type: 'externalService',

  displayTargets: function() {
    let hostname = this.get('hostname');
    if ( hostname ) {
      return hostname;
    }

    return (this.get('externalIpAddresses')||[]).join(', ');
  }.property('hostname','externalIpAddresses')
});
