import Service from 'ui/service/model';

var ExternalService = Service.extend({
  type: 'externalService',

  healthState: function() {
    return 'healthy';
  }.property(),
});

export default ExternalService;
