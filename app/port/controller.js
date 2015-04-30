import Cattle from 'ui/utils/cattle';

var PortController = Cattle.TransitioningResourceController.extend({
  _publicIp: null,
  _publicIpState: 0,
  displayPublicIp: function() {
    var ip = this.get('_publicIp');
    if ( ip )
    {
      return ip;
    }
    else if ( this && this.get('_publicIpState') === 2 )
    {
      return '(Unknown IP)';
    }
    else if ( this && this.get('_publicIpState') === 0 )
    {
      this.set('_publicIpState', 1);
      this.get('store').find('ipaddress', this.get('publicIpAddressId')).then((ip) => {
        this.set('_publicIp', ip.get('address'));
      }).catch(() => {
        this.set('_publicIpState', 2);
      });

      return 'Loading...';
    }

    return null;
  }.property('_publicIpState','_publicIp','publicIpAddressId'),
});

PortController.reopenClass({
  stateMap: {
   'active':    {icon: 'ss-record',   color: 'text-success'},
   'inactive':  {icon: 'fa fa-circle',color: 'text-danger'},
   'removed':   {icon: 'ss-trash',    color: 'text-danger'},
   'purged':    {icon: 'ss-tornado',  color: 'text-danger'}
  },
});

export default PortController;
