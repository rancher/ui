import Ember from 'ember';
import Service from 'ui/models/service';

var DnsService = Service.extend({
  type: 'dnsService',
  intl: Ember.inject.service(),

  healthState: 'healthy',
});

export default DnsService;
