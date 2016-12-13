import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import { PacketFacilities, PacketOs, PacketPlans} from 'ui/utils/packet-choices';


let osChoices = PacketOs.map(function(os) {
  os.enabled = (os.slug||'').toLowerCase() === 'ubuntu_14_04';
  return os;
});

let planChoices = PacketPlans.filter(function(plan) {
  return (plan.line||'').toLowerCase() === 'baremetal';
}).map((plan) => {
  plan.enabled = (plan.slug||'').toLowerCase() !== 'baremetal_2';
  return plan;
});

export default Ember.Component.extend(Driver, {
  driverName      : 'packet',
  packetConfig    : Ember.computed.alias('model.packetConfig'),

  facilityChoices : PacketFacilities,
  planChoices     : planChoices,
  osChoices       : osChoices,

  bootstrap: function() {
    let store = this.get('store');
    let config = store.createRecord({
      type         : 'packetConfig',
      apiKey       : '',
      projectId    : '',
      os           : 'ubuntu_14_04',
      facilityCode : 'ewr1',
      plan         : 'baremetal_0',
      billingCycle : 'hourly',
    });

    this.set('model', store.createRecord({
      type: 'host',
      packetConfig: config,
    }));
  },

  validate: function() {
    this._super();
    let errors = this.get('errors')||[];

    if (!this.get('packetConfig.projectId') ) {
      errors.push('Project ID is required');
    }

    if (!this.get('packetConfig.apiKey') ) {
      errors.push('API Key is requried');
    }

    if ( errors.length ) {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },
});
