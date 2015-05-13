import Ember from 'ember';
import NewHost from 'ui/mixins/new-host';

export default Ember.ObjectController.extend(NewHost, {
  initFields: function() {
    this._super();
    this.set('vpcOrSubnetId', this.get('amazonec2Config.subnetId') || this.get('amazonec2Config.vpcId'));
  },

  validate: function() {
    return this._super();
  },

  vpcOrSubnetId: null,
  vpcOrSubnetIdChanged: function() {
    var val = (this.get('vpcOrSubnetId')||'').trim();
    var vpcId = null;
    var subnetId = null;

    if ( val.indexOf('vpc-') === 0 )
    {
      vpcId = val;
    }
    else if ( val.indexOf('subnet-') === 0 )
    {
      subnetId = val;
    }

    this.set('amazonec2Config.vpcId', vpcId);
    this.set('amazonec2Config.subnetId', subnetId);
  }.observes('vpcOrSubnetId'),

  doneSaving: function() {
    var out = this._super();
    this.transitionToRoute('hosts');
    return out;
  },
});
