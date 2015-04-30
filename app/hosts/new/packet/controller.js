import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

import Plans from './packet_plans';
import Facilities from './packet_facilities';
import OSes from './packet_oses';

var osChoices = OSes.filter(function(os) {
  return (os.distro||'').toLowerCase() === 'ubuntu';
});

export default Ember.ObjectController.extend(Cattle.NewOrEditMixin, {
  needs: ['hosts/new'],
  error: null,
  facilityChoices: Facilities,
  planChoices: Plans,
  osChoices: osChoices,

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
