import Ember from 'ember';
import NewHost from 'ui/mixins/new-host';

import Plans from './packet_plans';
import Facilities from './packet_facilities';
import OSes from './packet_oses';

var osChoices = OSes.filter(function(os) {
  return (os.distro||'').toLowerCase() === 'ubuntu';
});

export default Ember.Controller.extend(NewHost, {
  packetConfig: Ember.computed.alias('model.packetConfig'),

  facilityChoices: Facilities,
  planChoices: Plans,
  osChoices: osChoices,

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
