import Service from 'ui/models/service';

var ComposeService = Service.extend({
  type: 'composeService',
});

ComposeService.reopenClass({
  alwaysInclude: ['stack','instances']
});

export default ComposeService;
