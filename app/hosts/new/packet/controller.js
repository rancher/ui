import Ember from 'ember';
import DriverController from 'ui/hosts/new/driver-controller';

import Plans from './packet_plans';
import Facilities from './packet_facilities';
import OSes from './packet_oses';

var osChoices = OSes.filter(function(os) {
  return (os.distro||'').toLowerCase() === 'ubuntu';
});

export default DriverController.extend({
  packetConfig: Ember.computed.alias('model.packetConfig'),

  facilityChoices: Facilities,
  planChoices: Plans,
  osChoices: osChoices,
});
