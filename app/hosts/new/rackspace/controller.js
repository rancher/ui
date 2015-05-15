import Ember from 'ember';
import NewHost from 'ui/mixins/new-host';
import Flavors from 'ui/hosts/new/rackspace/flavors';

var flavorChoices = [];
Flavors.forEach(function(flavor) {
  var parts = flavor.name.match(/^(\d+)\s*([a-z]+)\s*(.*)$/i);
  if ( parts )
  {
    var sizeMb = parseInt(parts[1],10);
    if ( parts[2].toLowerCase() === 'gb' )
    {
      sizeMb *= 1024;
    }

    flavorChoices.push({
      group: parts[3],
      label: parts[3] + ': ' + parts[1] + ' ' + parts[2],
      value: flavor.id,
      sizeMb: sizeMb
    });
  }
});

flavorChoices.sort(function(a,b) {
  var ag = a.group;
  var bg = b.group;
  var as = a.sizeMb;
  var bs = b.sizeMb;

  if ( ag < bg )
  {
    return -1;
  }
  else if ( ag > bg )
  {
    return 1;
  }
  else
  {
    return as - bs;
  }
});

export default Ember.ObjectController.extend(NewHost, {
  flavorChoices: flavorChoices,
  regionChoices: [
    {label: 'Dallas (DFW)', value: 'DFW'},
    {label: 'Hong Kong (HKG)', value: 'HKG'},
    {label: 'Northern Virginia (IAD)', value: 'IAD'},
    {label: 'Sydney (SYD)', value: 'SYD'},
  ],
  validate: function() {
    return this._super();
  },

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
