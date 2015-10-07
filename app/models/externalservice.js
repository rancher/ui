import Service from 'ui/models/service';

var ExternalService = Service.extend({
  type: 'externalService',

  healthState: function() {
    return 'healthy';
  }.property(),
});

export default ExternalService;
