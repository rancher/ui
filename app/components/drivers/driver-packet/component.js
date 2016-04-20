import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import { PacketFacilities, PacketOs, PacketPlans} from 'ui/utils/packet-choices';


let osChoices = PacketOs.filter(function(os) {
  return (os.distro||'').toLowerCase() === 'ubuntu';
});

export default Ember.Component.extend(Driver, {
  driverName      : 'packet',
  packetConfig    : Ember.computed.alias('model.packetConfig'),

  facilityChoices : PacketFacilities,
  planChoices     : PacketPlans,
  osChoices       : osChoices,

  bootstrap: function() {
    let store = this.get('store');
    let config = store.createRecord({
      type         : 'packetConfig',
      apiKey       : '',
      projectId    : '',
      os           : 'ubuntu_14_04',
      facilityCode : 'ewr1',
      plan         : 'baremetal_1',
      billingCycle : 'hourly',
    });

    this.set('model', store.createRecord({
      type: 'machine',
      packetConfig: config,
    }));
  }
});
