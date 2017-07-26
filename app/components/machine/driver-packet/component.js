import Ember from 'ember';
import Driver from 'ui/mixins/driver';
import { PacketFacilities, PacketOs, PacketPlans} from 'ui/utils/packet-choices';


let osChoices = PacketOs.filterBy('enabled', true);

let planChoices = PacketPlans.filter(function(plan) {
  return (plan.line||'').toLowerCase() === 'baremetal';
}).map((plan) => {
  plan.enabled = (plan.slug||'').toLowerCase() !== 'baremetal_2';
  return plan;
});

export default Ember.Component.extend(Driver, {
  driverName      : 'packet',
  packetConfig    : Ember.computed.alias('model.publicValues.packetConfig'),

  facilityChoices : PacketFacilities,
  planChoices     : planChoices,
  osChoices       : osChoices,

  bootstrap: function() {
    let store = this.get('store');
    let config = store.createRecord({
      type         : 'packetConfig',
      projectId    : '',
      os           : 'ubuntu_14_04',
      facilityCode : 'ewr1',
      plan         : 'baremetal_0',
      billingCycle : 'hourly',
    });

    this.set('model', this.get('store').createRecord({
      type:         'hostTemplate',
      driver:       'packet',
      publicValues: {
        packetConfig: config
      },
      secretValues: {
        packetConfig: {
          apiKey       : '',
        }
      }
    }));
  },

  validate: function() {
    let errors = [];

    if (!this.get('packetConfig.projectId') ) {
      errors.push('Project ID is required');
    }

    if (!this.get('model.secretValues.packetConfig.apiKey') ) {
      errors.push('API Key is requried');
    }

    if ( errors.length ) {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },
});
